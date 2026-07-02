import React, { useMemo, type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { useConfig } from '@openmrs/esm-framework';
import { getActivityAwareRefreshInterval } from './activityAwareRefreshInterval';
import { type ConfigObject } from './config-schema';

/**
 * Provides an activity-aware, configurable SWR `refreshInterval` to the queue data hooks rendered
 * beneath it: polling steps up while the user interacts with a visible tab and eases off when the
 * tab is idle or hidden. Wraps the views that previously received a fixed interval via their
 * lifecycle `swrConfig`, which cannot read configuration.
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
