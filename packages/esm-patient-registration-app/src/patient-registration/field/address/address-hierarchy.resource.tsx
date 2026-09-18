import { useCallback, useEffect, useMemo } from 'react';
import { useField } from 'formik';
import useSWRImmutable from 'swr/immutable';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { usePatientRegistrationContext } from '../../patient-registration-context';

interface AddressFields {
  addressField: string;
}

/**
 * The shape the addresshierarchy module serializes when one of its legacy `.form` handlers throws:
 * a Java exception rendered as JSON, rather than the expected array of entries.
 */
interface SerializedServerException {
  message?: string;
  localizedMessage?: string;
  stackTrace?: unknown;
  cause?: unknown;
}

function isSerializedServerException(body: unknown): body is SerializedServerException {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return false;
  }

  // A serialized Java exception always carries its message alongside the fields that identify it as
  // a throwable rather than a payload.
  return ('message' in body || 'localizedMessage' in body) && ('stackTrace' in body || 'cause' in body);
}

/**
 * These addresshierarchy endpoints are legacy `.form` handlers rather than part of the REST API,
 * and they do not use HTTP status codes to report failure: when the module throws, they answer
 * HTTP 200 with a body that is a serialized Java exception (an object with `message`,
 * `localizedMessage`, `stackTrace` and `cause`) instead of the expected array of entries. They can
 * likewise answer 200 with an empty or null body. A successful status therefore does not imply a
 * usable payload, and SWR has no error of its own to report.
 *
 * Validate the body here so that anything which is not the expected array is surfaced through
 * SWR's `error`, letting callers fall through to their existing error states instead of mapping
 * over `undefined` (or over an exception object) and crashing the registration form during render.
 */
async function fetchAddressHierarchyEntries<T>(url: string): Promise<FetchResponse<Array<T>>> {
  const response = await openmrsFetch<Array<T> | SerializedServerException>(url);
  const body = response?.data;

  if (Array.isArray(body)) {
    return response as FetchResponse<Array<T>>;
  }

  if (isSerializedServerException(body)) {
    // Report the server's own message; the accompanying stack trace is too noisy for the console.
    throw new Error(
      `The address hierarchy module responded to ${url} with a server error: ${body.message ?? body.localizedMessage}`,
    );
  }

  throw new Error(`Expected an array of address hierarchy entries from ${url}, but the response body was not an array`);
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
    () => (!isLoadingFieldOrder ? (orderedFields?.findIndex((field) => field === addressField) ?? -1) : -1),
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
    orderedFields?.slice(index + 1).map((fieldName) => {
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
