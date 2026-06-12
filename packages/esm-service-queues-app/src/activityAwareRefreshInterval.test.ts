import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACTIVE_REFRESH_INTERVAL,
  IDLE_REFRESH_INTERVAL,
  getActivityAwareRefreshInterval,
} from './activityAwareRefreshInterval';

const IDLE_TIMEOUT = 60_000;
const refreshInterval = getActivityAwareRefreshInterval();

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
};

describe('getActivityAwareRefreshInterval', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    refreshInterval();
    setVisibility('visible');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the active interval while the user is active', () => {
    expect(refreshInterval()).toBe(ACTIVE_REFRESH_INTERVAL);
  });

  it('returns the idle interval after the idle timeout elapses without interaction', () => {
    vi.advanceTimersByTime(IDLE_TIMEOUT + 1);

    expect(refreshInterval()).toBe(IDLE_REFRESH_INTERVAL);
  });

  it('returns to the active interval when the user interacts again', () => {
    vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
    expect(refreshInterval()).toBe(IDLE_REFRESH_INTERVAL);

    window.dispatchEvent(new Event('mousemove'));
    expect(refreshInterval()).toBe(ACTIVE_REFRESH_INTERVAL);
  });

  it('treats a hidden tab as idle and a re-shown tab as active', () => {
    setVisibility('hidden');
    expect(refreshInterval()).toBe(IDLE_REFRESH_INTERVAL);

    setVisibility('visible');
    expect(refreshInterval()).toBe(ACTIVE_REFRESH_INTERVAL);
  });

  it('honors custom active and idle intervals', () => {
    const customInterval = getActivityAwareRefreshInterval(30_000, 60_000);

    expect(customInterval()).toBe(30_000);

    vi.advanceTimersByTime(IDLE_TIMEOUT + 1);
    expect(customInterval()).toBe(60_000);
  });
});
