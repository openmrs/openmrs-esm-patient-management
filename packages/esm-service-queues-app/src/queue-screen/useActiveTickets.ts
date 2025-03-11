import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const useActiveTickets = () => {
  const { data, isLoading, error, mutate } = useSWR<{ data: Record<string, { status: string; ticketNumber: string }> }>(
    `${restBaseUrl}/queueutil/active-tickets`,
    openmrsFetch,
    { refreshInterval: 3000 },
  );
  const activeTickets =
    Array.from(Object.entries(data?.data ?? {}).map(([key, value]) => ({ room: key, ...value }))) ?? [];
  return { activeTickets, isLoading, error, mutate };
};
