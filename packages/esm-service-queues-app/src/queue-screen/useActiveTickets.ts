import { useMemo } from 'react';
import { openmrsFetch, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { getActivityAwareRefreshInterval } from '../activityAwareRefreshInterval';
import { type ConfigObject } from '../config-schema';

export const useActiveTickets = () => {
  const {
    refreshIntervals: { queueScreen },
  } = useConfig<ConfigObject>();
  const refreshInterval = useMemo(
    () => getActivityAwareRefreshInterval(queueScreen.active, queueScreen.idle),
    [queueScreen.active, queueScreen.idle],
  );
  const { data, isLoading, error, mutate } = useSWR<{ data: Record<string, { status: string; ticketNumber: string }> }>(
    `${restBaseUrl}/queueutil/active-tickets`,
    openmrsFetch,
    { refreshInterval, revalidateOnFocus: true },
  );
  const activeTickets =
    Array.from(Object.entries(data?.data ?? {}).map(([key, value]) => ({ room: key, ...value }))) ?? [];
  return { activeTickets, isLoading, error, mutate };
};
