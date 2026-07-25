import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import useSWR from 'swr';
import { useAverageWaitTime } from './metrics.resource';

vi.mock('swr', () => ({ default: vi.fn() }));

const mockUseSWR = vi.mocked(useSWR);

describe('useAverageWaitTime', () => {
  it('bounds the average to entries started today', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true } as ReturnType<typeof useSWR>);
    renderHook(() => useAverageWaitTime('service-1', 'location-1', 'status-1'));

    // The exact format matters as much as the parameter itself; see useAverageWaitTime.
    const url = decodeURIComponent(mockUseSWR.mock.calls[0][0] as string);
    expect(url).toMatch(/&startedOnOrAfter=\d{4}-\d{2}-\d{2} 00:00:00/);
  });
});
