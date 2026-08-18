import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { restBaseUrl, useOpenmrsFetchAll, useSession } from '@openmrs/esm-framework';
import { useActiveVisits, useAverageWaitTime } from './metrics.resource';

vi.mock('swr', () => ({ default: vi.fn() }));

const mockUseSWR = vi.mocked(useSWR);
const mockUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);
const mockUseSession = vi.mocked(useSession);

const today = dayjs().toISOString();

function fetchAllResult(data: Array<unknown>) {
  return {
    data,
    error: undefined,
    isLoading: false,
    isValidating: false,
    totalCount: data.length,
    hasMore: false,
    loadMore: vi.fn(),
    mutate: vi.fn(),
    nextUri: null,
  } as any;
}

describe('useActiveVisits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({ sessionLocation: { uuid: 'session-location' } } as any);
    mockUseOpenmrsFetchAll.mockReturnValue(fetchAllResult([]));
  });

  it("requests today's active visits at the given location", () => {
    renderHook(() => useActiveVisits('location-1'));
    const url = mockUseOpenmrsFetchAll.mock.calls[0][0] as string;
    expect(url).toContain(`${restBaseUrl}/visit?includeInactive=false`);
    expect(url).toContain('&location=location-1');
    expect(url).toContain(`&fromStartDate=${dayjs().format('YYYY-MM-DD')}`);
    expect(url).toContain('person:(uuid,display,age,gender,birthdate,preferredName,dead,deathDate)');
  });

  it('falls back to the session location when none is passed', () => {
    renderHook(() => useActiveVisits());
    const url = mockUseOpenmrsFetchAll.mock.calls[0][0] as string;
    expect(url).toContain('&location=session-location');
  });

  it('dedupes visits by patient, keeping the first visit per patient', () => {
    mockUseOpenmrsFetchAll.mockReturnValue(
      fetchAllResult([
        { uuid: 'v1', startDatetime: today, patient: { uuid: 'p1' } },
        { uuid: 'v2', startDatetime: today, patient: { uuid: 'p1' } },
        { uuid: 'v3', startDatetime: today, patient: { uuid: 'p2' } },
      ]),
    );
    const { result } = renderHook(() => useActiveVisits('location-1'));
    expect(result.current.activeVisits.map((visit) => visit.uuid)).toEqual(['v1', 'v3']);
    expect(result.current.activeVisitsCount).toBe(2);
  });

  it('skips visits without a patient uuid', () => {
    mockUseOpenmrsFetchAll.mockReturnValue(
      fetchAllResult([
        { uuid: 'v1', startDatetime: today, patient: undefined },
        { uuid: 'v2', startDatetime: today, patient: { uuid: 'p2' } },
      ]),
    );
    const { result } = renderHook(() => useActiveVisits('location-1'));
    expect(result.current.activeVisits.map((visit) => visit.uuid)).toEqual(['v2']);
  });
});

describe('useAverageWaitTime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bounds the average to today, sent in the format and timezone the queue module parses', () => {
    mockUseSWR.mockReturnValue({ data: undefined, error: undefined, isLoading: true } as ReturnType<typeof useSWR>);
    renderHook(() => useAverageWaitTime('service-1', 'location-1', 'status-1'));

    const url = decodeURIComponent(mockUseSWR.mock.calls[0][0] as string);
    const startedOnOrAfter = url.match(/&startedOnOrAfter=([^&]+)/)?.[1];

    expect(startedOnOrAfter).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    // Appending Z reads it back as UTC, which is how the server parses the zone-less string.
    expect(new Date(`${startedOnOrAfter}Z`).getTime()).toBe(dayjs().startOf('day').valueOf());
  });
});
