import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import dayjs from 'dayjs';
import { type FetchResponse, openmrsFetch, type Visit } from '@openmrs/esm-framework';
import { usePastVisits } from './past-visit.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      dedupingInterval: 0,
      provider: () => new Map(),
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }}>
    {children}
  </SWRConfig>
);

const patientUuid = 'patient-1';
const today = dayjs().toISOString();
const yesterday = dayjs().subtract(1, 'day').toISOString();
const twoDaysAgo = dayjs().subtract(2, 'day').toISOString();

// The REST API returns visits most-recent-first, and the hook relies on that ordering rather than sorting.
function mockVisits(...visits: Array<Partial<Visit>>) {
  mockOpenmrsFetch.mockResolvedValue({ data: { results: visits } } as FetchResponse);
}

describe('usePastVisits', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
    mockVisits();
  });

  it('requests the group member display that the shared visit summary reads unguarded', async () => {
    renderHook(() => usePastVisits(patientUuid), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalled());
    expect(mockOpenmrsFetch.mock.calls[0][0]).toContain(
      'groupMembers:(uuid,concept:(uuid,display),value:(uuid,display),display)',
    );
  });

  it('excludes the current visit when it started before today', async () => {
    mockVisits({ uuid: 'current', startDatetime: yesterday }, { uuid: 'past', startDatetime: twoDaysAgo });

    const { result } = renderHook(() => usePastVisits(patientUuid, 'current'), { wrapper });

    await waitFor(() => expect(result.current.visits?.uuid).toBe('past'));
  });

  it('returns the most recent past visit when it is not the current visit', async () => {
    mockVisits({ uuid: 'yesterday', startDatetime: yesterday }, { uuid: 'older', startDatetime: twoDaysAgo });

    const { result } = renderHook(() => usePastVisits(patientUuid, 'current'), { wrapper });

    await waitFor(() => expect(result.current.visits?.uuid).toBe('yesterday'));
  });

  it("excludes today's visits, even when they are not the current visit", async () => {
    mockVisits({ uuid: 'today', startDatetime: today }, { uuid: 'past', startDatetime: yesterday });

    const { result } = renderHook(() => usePastVisits(patientUuid, 'current'), { wrapper });

    await waitFor(() => expect(result.current.visits?.uuid).toBe('past'));
  });
});
