import { act, renderHook } from '@testing-library/react';
import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import { useCurrentTime } from './useCurrentTime';

describe('useCurrentTime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Independent timers would drift apart by up to a minute, so a table's row durations and the
  // metrics above them would stop agreeing.
  it('hands every caller the same instant, before and after a tick', () => {
    const { result: firstResult } = renderHook(() => useCurrentTime());
    const { result: secondResult } = renderHook(() => useCurrentTime());

    expect(firstResult.current).toBe(secondResult.current);
    const before = firstResult.current;

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(firstResult.current).toBe(secondResult.current);
    expect(firstResult.current).not.toBe(before);
  });

  it('runs one timer however many callers there are', () => {
    renderHook(() => useCurrentTime());
    renderHook(() => useCurrentTime());
    renderHook(() => useCurrentTime());

    expect(vi.getTimerCount()).toBe(1);
  });

  it('keeps ticking until the last caller goes, then stops', () => {
    const { unmount: unmountFirst } = renderHook(() => useCurrentTime());
    const { unmount: unmountSecond } = renderHook(() => useCurrentTime());

    unmountFirst();
    expect(vi.getTimerCount()).toBe(1);

    unmountSecond();
    expect(vi.getTimerCount()).toBe(0);
  });

  // The store keeps whatever instant it was left on while nothing is subscribed.
  it('refreshes the clock for a caller that arrives after it stopped', () => {
    const { result, unmount } = renderHook(() => useCurrentTime());
    const before = result.current;
    unmount();

    act(() => {
      vi.advanceTimersByTime(5 * 60_000);
    });

    const { result: later } = renderHook(() => useCurrentTime());
    expect(later.current.getTime()).toBeGreaterThan(before.getTime());
  });
});
