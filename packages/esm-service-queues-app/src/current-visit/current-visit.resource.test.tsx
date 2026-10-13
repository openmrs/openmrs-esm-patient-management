import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import dayjs from 'dayjs';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { omrsDateFormat } from '../constants';
import { useTodaysAppointments } from './current-visit.resource';

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
const now = new Date('2026-10-13T10:30:00');

function mockAppointments(...statuses: Array<string>) {
  mockOpenmrsFetch.mockResolvedValue({
    data: statuses.map((status, index) => ({ uuid: `appointment-${index}`, status })),
  } as FetchResponse);
}

describe('useTodaysAppointments', () => {
  beforeEach(() => {
    // Only fake Date, so that SWR and waitFor still run on real timers.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(now);
    mockOpenmrsFetch.mockReset();
    mockAppointments();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("searches the patient's appointments for today with a POST request", async () => {
    renderHook(() => useTodaysAppointments(patientUuid, ['Scheduled']), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalled());
    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      expect.stringContaining('/appointments/search'),
      expect.objectContaining({
        method: 'POST',
        body: {
          patientUuid,
          startDate: dayjs('2026-10-13T00:00:00.000').format(omrsDateFormat),
          endDate: dayjs('2026-10-13T23:59:59.999').format(omrsDateFormat),
        },
      }),
    );
  });

  it('returns only the appointments with the given statuses', async () => {
    mockAppointments('Scheduled', 'Cancelled', 'Requested', 'CheckedIn');

    const { result } = renderHook(() => useTodaysAppointments(patientUuid, ['Scheduled', 'CheckedIn']), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.appointments.map(({ status }) => status)).toEqual(['Scheduled', 'CheckedIn']);
  });

  it('returns no appointments when the patient has none today', async () => {
    const { result } = renderHook(() => useTodaysAppointments(patientUuid, ['Scheduled']), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockOpenmrsFetch).toHaveBeenCalled();
    expect(result.current.appointments).toEqual([]);
  });

  it('does not fetch without a patient', async () => {
    const { result } = renderHook(() => useTodaysAppointments(undefined, ['Scheduled']), { wrapper });

    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
    expect(result.current.appointments).toEqual([]);
  });
});
