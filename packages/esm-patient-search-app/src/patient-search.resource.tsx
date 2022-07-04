import React, { useCallback, useMemo } from 'react';
import { openmrsFetch, FetchResponse } from '@openmrs/esm-framework';
import useSWR from 'swr';

export interface FHIRPatientType {
  id: string;
  identifier: Array<{
    id: string;
    use: string;
    value: string;
  }>;
  name: Array<{
    id: string;
    family: string;
    given: Array<string>;
  }>;
  gender: string;
  birthDate: string;
  deceasedBoolean: boolean;
  address: Array<{
    id: string;
    use: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
}

interface FHIRPatientSearchResponse {
  total: number;
  link?: Array<{
    relation: 'self' | 'previous' | 'next';
    url: string;
  }>;
  entry: Array<{
    resource: FHIRPatientType;
  }>;
}

export function usePatientSearchFHIR(
  searchTerm: string,
  searching: boolean = true,
  resultsToFetch: number = 10,
  sort: string,
  page: number,
) {
  // name:contains=${searchTerm}&
  let url = `/ws/fhir2/R4/Patient?_count=${resultsToFetch}`;
  if (page > 1) {
    url += `&_getpagesoffset=${(page - 1) * resultsToFetch}`;
  }
  if (sort) {
    url += `&_sort=${sort}`;
  }

  const { data, isValidating, error } = useSWR<FetchResponse<FHIRPatientSearchResponse>, Error>(
    searching ? url : null,
    openmrsFetch,
  );

  const results: {
    data: Array<FHIRPatientType>;
    isLoading: boolean;
    fetchError: any;
    hasMore: boolean;
    loadingNewData: boolean;
    totalResults: number;
  } = useMemo(
    () => ({
      data: data ? data?.data?.entry.map((entry) => entry.resource) : null,
      isLoading: !data && !error,
      fetchError: error,
      hasMore: data?.data?.link?.some((link) => link.relation === 'next'),
      loadingNewData: isValidating,
      totalResults: data?.data?.total,
    }),
    [data, isValidating, error],
  );

  return results;
}
