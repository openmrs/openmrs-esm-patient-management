import React, { useMemo, type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { useConfig } from '@openmrs/esm-framework';
import { getActivityAwareRefreshInterval } from './activity-aware-refresh-interval';
import { type ConfigObject } from './config-schema';

/**
 * Provides the configured, activity-aware SWR `refreshInterval` to the queue data hooks rendered
 * beneath it. Needed because a lifecycle `swrConfig` cannot read configuration.
 *
 * Revalidating on focus is what keeps a tab that has been in the background from showing stale data:
 * SWR schedules the next poll while the tab is still hidden, so it lands up to one idle interval after
 * the user returns. The framework default throttles focus revalidation to 30 minutes, which is far too
 * coarse to cover that, hence the override.
 */
const SwrConfig: React.FC<PropsWithChildren> = ({ children }) => {
  const {
    refreshIntervals: { dashboard },
  } = useConfig<ConfigObject>();
  const refreshInterval = useMemo(
    () => getActivityAwareRefreshInterval(dashboard.active, dashboard.idle),
    [dashboard.active, dashboard.idle],
  );

  return (
    <SWRConfig value={{ refreshInterval, revalidateOnFocus: true, focusThrottleInterval: 10_000 }}>
      {children}
    </SWRConfig>
  );
};

export default SwrConfig;
