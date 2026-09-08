import throttle from 'lodash-es/throttle';

const IDLE_TIMEOUT = 60_000;

const interactionEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

let isActive = true;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let initialized = false;

const markActive = () => {
  isActive = document.visibilityState === 'visible';
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    isActive = false;
  }, IDLE_TIMEOUT);
};

// Interaction events fire many times a second; the first of each burst is enough to restart the
// countdown.
const throttledMarkActive = throttle(markActive, 1_000, { leading: true, trailing: false });

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible') {
    markActive();
  } else {
    clearTimeout(idleTimer);
    isActive = false;
  }
};

const initialize = () => {
  if (initialized) {
    return;
  }
  initialized = true;
  interactionEvents.forEach((event) => window.addEventListener(event, throttledMarkActive, { passive: true }));
  document.addEventListener('visibilitychange', handleVisibilityChange);
  markActive();
};

/**
 * Returns a function for SWR's `refreshInterval` that polls at `activeRefreshInterval` while the user
 * is interacting with the tab and `idleRefreshInterval` once they have gone idle. SWR skips polling
 * entirely while the tab is hidden, so tracking visibility here only affects the rate SWR picks for
 * the tick after the user returns, not the one already scheduled; `SwrConfig` revalidates on focus to
 * cover that gap.
 */
export const getActivityAwareRefreshInterval = (activeRefreshInterval: number, idleRefreshInterval: number) => () => {
  initialize();
  return isActive ? activeRefreshInterval : idleRefreshInterval;
};
