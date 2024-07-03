import useSWRInfinite from 'swr/infinite';
import { useCallback, useMemo } from 'react';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { type PatientOrderFetchResponse } from '../types';
import { careSettingUuid } from '@openmrs/esm-patient-common-lib';

export function usePatientPendingOrders(patientUuid: string, status?: 'ACTIVE' | 'any', orderTypes?: string[]) {
  const baseOrdersUrl = `${restBaseUrl}/order?patient=${patientUuid}&careSetting=${careSettingUuid}&v=full&status=${status}`;

  // Function to generate the key for useSWRInfinite based on the order type and page index
  const getKey = (pageIndex: number, previousPageData: FetchResponse<PatientOrderFetchResponse> | null) => {
    // Return null to stop fetching if there's no more data
    if (previousPageData && !previousPageData.data.results.length) return null;

    // If orderTypes is provided, cycle through them for each page
    const orderType = orderTypes && orderTypes.length > 0 ? orderTypes[pageIndex % orderTypes.length] : null;
    return orderType ? `${baseOrdersUrl}&orderType=${orderType}` : baseOrdersUrl;
  };

  // Using useSWRInfinite to handle fetching
  const {
    data: responsePages,
    error,
    isLoading,
    isValidating,
    size,
    setSize,
    mutate,
  } = useSWRInfinite<FetchResponse<PatientOrderFetchResponse>, Error>(getKey, openmrsFetch);

  // Combine and sort the data from all pages
  const orders = useMemo(() => {
    const allResults = responsePages ? responsePages.flatMap((page) => page.data.results) : [];
    return allResults.sort((order1, order2) => (order2.dateActivated > order1.dateActivated ? 1 : -1));
  }, [responsePages]);

  // Function to load more data/pages
  const loadMore = useCallback(() => setSize(size + 1), [size, setSize]);

  return {
    data: orders,
    error,
    isLoading,
    isValidating,
    loadMore,
    mutate,
  };
}
