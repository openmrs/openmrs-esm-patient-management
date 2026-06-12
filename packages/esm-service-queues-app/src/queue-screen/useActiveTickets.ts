import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { getActivityAwareRefreshInterval } from '../activityAwareRefreshInterval';

const refreshInterval = getActivityAwareRefreshInterval();

export const useActiveTickets = () => {
  const { data, isLoading, error, mutate } = useSWR<{ data: Record<string, { status: string; ticketNumber: string }> }>(
    `${restBaseUrl}/queueutil/active-tickets`,
    openmrsFetch,
    { refreshInterval, revalidateOnFocus: true },
  );
  const activeTickets =
    Array.from(Object.entries(data?.data ?? {}).map(([key, value]) => ({ room: key, ...value }))) ?? [];
  return { activeTickets, isLoading, error, mutate };
};
