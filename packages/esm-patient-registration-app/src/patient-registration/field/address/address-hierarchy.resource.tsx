import { useCallback, useEffect, useMemo } from 'react';
import { useField } from 'formik';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { usePatientRegistrationContext } from '../../patient-registration-context';

interface AddressFields {
  addressField: string;
}

/**
 * The address hierarchy module serves these endpoints from legacy `.form` handlers that
 * content-negotiate: given a browser-style `Accept` header, they can answer with a 200 response
 * carrying an OpenMRS HTML page instead of the expected JSON array. `openmrsFetch` parses the
 * response body in a try / catch, so such a response resolves as a success with `data` left
 * `undefined`. Treat a body that isn't the expected array as a failed request rather than as an
 * empty result, so that callers fall through to their error state instead of silently rendering an
 * address section with no fields.
 */
async function fetchAddressHierarchyEntries<T>(url: string): Promise<FetchResponse<Array<T>>> {
  const response = await openmrsFetch<Array<T>>(url);

  if (!Array.isArray(response?.data)) {
    throw new Error(
      `Expected a JSON array of address hierarchy entries from ${url}, but the response body could not be parsed as one`,
    );
  }

  return response;
}

export function useOrderedAddressHierarchyLevels() {
  const url = '/module/addresshierarchy/ajax/getOrderedAddressHierarchyLevels.form';
  const { data, isLoading, error } = useSWRImmutable<FetchResponse<Array<AddressFields>>, Error>(
    url,
    fetchAddressHierarchyEntries<AddressFields>,
  );

  const results = useMemo(
    () => ({
      orderedFields: data?.data?.map((field) => field.addressField) ?? [],
      isLoadingFieldOrder: isLoading,
      errorFetchingFieldOrder: error,
    }),
    [data, isLoading, error],
  );

  return results;
}

export function useAddressEntries(fetchResults, searchString) {
  const encodedSearchString = encodeURIComponent(searchString);
  const { data, isLoading, error } = useSWRImmutable<FetchResponse<Array<{ name: string }>>>(
    fetchResults
      ? `module/addresshierarchy/ajax/getChildAddressHierarchyEntries.form?searchString=${encodedSearchString}`
      : null,
    fetchAddressHierarchyEntries<{ name: string }>,
  );

  useEffect(() => {
    if (error) {
      console.error(error);
    }
  }, [error]);

  const results = useMemo(
    () => ({
      entries: data?.data?.map((item) => item.name) ?? [],
      isLoadingAddressEntries: isLoading,
      errorFetchingAddressEntries: error,
    }),
    [data, isLoading, error],
  );
  return results;
}

/**
 * This hook is being used to fetch ordered address fields as configured in the address hierarchy
 * This hook returns the valid search term for valid fields to get suitable entries for the field
 * This also returns the function to reset the lower ordered fields if the value of a field is changed.
 */
export function useAddressEntryFetchConfig(addressField: string) {
  const { orderedFields, isLoadingFieldOrder } = useOrderedAddressHierarchyLevels();
  const { setFieldValue } = usePatientRegistrationContext();
  const [, { value: addressValues }] = useField('address');

  const index = useMemo(
    () => (!isLoadingFieldOrder ? orderedFields.findIndex((field) => field === addressField) : -1),
    [orderedFields, addressField, isLoadingFieldOrder],
  );

  const addressFieldSearchConfig = useMemo(() => {
    let fetchEntriesForField = true;
    const previousSelectedFields = orderedFields?.slice(0, index) ?? [];
    let previousSelectedValues = [];
    for (const fieldName of previousSelectedFields) {
      if (!addressValues[fieldName]) {
        fetchEntriesForField = false;
        break;
      }
      previousSelectedValues.push(addressValues[fieldName]);
    }
    return {
      fetchEntriesForField,
      searchString: previousSelectedValues.join('|'),
    };
  }, [orderedFields, index, addressValues]);

  const updateChildElements = useCallback(() => {
    if (isLoadingFieldOrder) {
      return;
    }
    orderedFields.slice(index + 1).map((fieldName) => {
      setFieldValue(`address.${fieldName}`, '');
    });
  }, [index, isLoadingFieldOrder, orderedFields, setFieldValue]);

  const results = useMemo(
    () => ({
      ...addressFieldSearchConfig,
      updateChildElements,
    }),
    [addressFieldSearchConfig, updateChildElements],
  );

  return results;
}

export function useAddressHierarchy(searchString: string, separator: string) {
  const { data, error, isLoading } = useSWRImmutable<
    FetchResponse<
      Array<{
        address: string;
      }>
    >,
    Error
  >(
    searchString
      ? `/module/addresshierarchy/ajax/getPossibleFullAddresses.form?separator=${separator}&searchString=${searchString}`
      : null,
    fetchAddressHierarchyEntries<{ address: string }>,
  );

  const results = useMemo(
    () => ({
      addresses: data?.data?.map((address) => address.address) ?? [],
      error,
      isLoading,
    }),
    [data?.data, error, isLoading],
  );
  return results;
}

export function useAddressHierarchyWithParentSearch(addressField: string, parentid: string, query: string) {
  const { data, error, isLoading } = useSWRImmutable<
    FetchResponse<
      Array<{
        uuid: string;
        name: string;
      }>
    >,
    Error
  >(
    query
      ? `/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form?addressField=${addressField}&limit=20&searchString=${query}&parentUuid=${parentid}`
      : null,
    fetchAddressHierarchyEntries<{ uuid: string; name: string }>,
  );

  const results = useMemo(
    () => ({
      error: error,
      isLoading,
      addresses: data?.data ?? [],
    }),
    [data?.data, error, isLoading],
  );

  return results;
}
