import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

export const useActiveTickets = (locationUuid?: string) => {
  const url = locationUuid
    ? `${restBaseUrl}/queueutil/active-tickets?locationUuid=${locationUuid}`
    : `${restBaseUrl}/queueutil/active-tickets`;
  const { data, isLoading, error, mutate } = useSWR<{
    data: Record<string, { status: string; ticketNumber: string; location?: string }>;
  }>(url, openmrsFetch, { refreshInterval: 3000 });
  const activeTickets =
    Array.from(Object.entries(data?.data ?? {}).map(([key, value]) => ({ room: key, ...value }))) ?? [];
  return { activeTickets, isLoading, error, mutate };
};
