import React, { useMemo, type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { useConfig } from '@openmrs/esm-framework';
import { getActivityAwareRefreshInterval } from './activity-aware-refresh-interval';
import { type ConfigObject } from './config-schema';

/**
 * Provides the configured, activity-aware SWR `refreshInterval` to the queue data hooks rendered
 * beneath it. Needed because a lifecycle `swrConfig` cannot read configuration.
 */
const SwrConfig: React.FC<PropsWithChildren> = ({ children }) => {
  const {
    refreshIntervals: { dashboard },
  } = useConfig<ConfigObject>();
  const refreshInterval = useMemo(
    () => getActivityAwareRefreshInterval(dashboard.active, dashboard.idle),
    [dashboard.active, dashboard.idle],
  );

  return <SWRConfig value={{ refreshInterval }}>{children}</SWRConfig>;
};

export default SwrConfig;
