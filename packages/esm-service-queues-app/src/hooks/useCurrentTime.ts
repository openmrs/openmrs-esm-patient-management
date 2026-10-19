import { useEffect } from 'react';
import { createGlobalStore, useStore } from '@openmrs/esm-framework';

const tickIntervalMs = 60_000;

// One clock for the whole app rather than one timer per caller: a table's row durations and the
// metrics above them come from the same instant, and independent timers drift apart by up to a minute.
const currentTimeStore = createGlobalStore<{ currentTime: Date }>('serviceQueuesCurrentTime', {
  currentTime: new Date(),
});

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let subscriberCount = 0;

/** The current time, refreshed every minute and shared by every caller. */
export function useCurrentTime() {
  const { currentTime } = useStore(currentTimeStore);

  useEffect(() => {
    subscriberCount++;
    if (intervalHandle === null) {
      // The clock is frozen while nothing is subscribed, so refresh it before handing it out.
      currentTimeStore.setState({ currentTime: new Date() });
      intervalHandle = setInterval(() => currentTimeStore.setState({ currentTime: new Date() }), tickIntervalMs);
    }

    return () => {
      subscriberCount--;
      if (subscriberCount === 0 && intervalHandle !== null) {
        clearInterval(intervalHandle);
        intervalHandle = null;
      }
    };
  }, []);

  return currentTime;
}
