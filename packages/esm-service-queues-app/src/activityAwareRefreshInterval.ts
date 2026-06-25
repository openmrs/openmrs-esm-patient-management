export const ACTIVE_REFRESH_INTERVAL = 5_000;
export const IDLE_REFRESH_INTERVAL = 30_000;
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
  interactionEvents.forEach((event) => window.addEventListener(event, markActive, { passive: true }));
  document.addEventListener('visibilitychange', handleVisibilityChange);
  markActive();
};

/**
 * Returns a function for SWR's `refreshInterval` that polls at `activeRefreshInterval` while the
 * user is actively interacting with a visible tab and `idleRefreshInterval` once the tab is idle or
 * hidden. SWR re-evaluates it after each poll, so the rate adapts on the next cycle.
 */
export const getActivityAwareRefreshInterval =
  (activeRefreshInterval = ACTIVE_REFRESH_INTERVAL, idleRefreshInterval = IDLE_REFRESH_INTERVAL) =>
  () => {
    initialize();
    return isActive ? activeRefreshInterval : idleRefreshInterval;
  };
