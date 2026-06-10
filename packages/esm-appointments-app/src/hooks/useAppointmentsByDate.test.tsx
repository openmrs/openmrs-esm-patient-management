import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useAppointmentsByDate } from './useAppointmentsByDate';

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

const mockAppointment = (overrides = {}) => ({
  uuid: 'test-uuid',
  appointmentNumber: '0001',
  appointmentKind: 'Scheduled',
  comments: '',
  endDateTime: null,
  location: { uuid: 'loc-uuid', name: 'Test Clinic' },
  patient: { identifier: 'PAT-001', name: 'Test Patient', uuid: 'pat-uuid' },
  provider: { uuid: 'prov-uuid', display: 'Dr. Test' },
  providers: [],
  recurring: false,
  service: { appointmentServiceId: 1, name: 'Outpatient', uuid: 'svc-uuid', durationMins: 15 },
  startDateTime: Date.now(),
  status: 'Scheduled',
  voided: false,
  extensions: {},
  teleconsultationLink: null,
  ...overrides,
});

describe('useAppointmentsByDate', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('returns empty appointments array when isoDate is null', () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);

    const { result } = renderHook(() => useAppointmentsByDate(null), { wrapper });

    expect(result.current.appointments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });

  it('returns empty appointments array when isoDate is undefined', () => {
    const { result } = renderHook(() => useAppointmentsByDate(undefined), { wrapper });

    expect(result.current.appointments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });

  it('constructs the correct URL when isoDate is provided', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);

    renderHook(() => useAppointmentsByDate('2026-06-09'), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    const url = mockOpenmrsFetch.mock.calls[0][0] as string;
    expect(url).toContain(`${restBaseUrl}/appointments?forDate=`);
    expect(url).toContain('2026-06-09');
  });

  it('extracts appointments from the API response', async () => {
    const appts = [mockAppointment({ uuid: 'a1' }), mockAppointment({ uuid: 'a2' })];
    mockOpenmrsFetch.mockResolvedValue({ data: appts } as FetchResponse);

    const { result } = renderHook(() => useAppointmentsByDate('2026-06-09'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.appointments).toHaveLength(2);
    expect(result.current.appointments[0].uuid).toBe('a1');
    expect(result.current.appointments[1].uuid).toBe('a2');
  });

  it('falls back to an empty array when data is undefined (empty response)', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: undefined } as unknown as FetchResponse);

    const { result } = renderHook(() => useAppointmentsByDate('2026-06-09'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.appointments).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('surfaces error when the fetch fails', async () => {
    const err = new Error('Network error');
    mockOpenmrsFetch.mockRejectedValue(err);

    const { result } = renderHook(() => useAppointmentsByDate('2026-06-09'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.appointments).toEqual([]);
  });

  it('switches SWR key from null to valid when isoDate transitions from null to a string', async () => {
    const appts = [mockAppointment({ uuid: 'late' })];
    mockOpenmrsFetch.mockResolvedValue({ data: appts } as FetchResponse);

    const { result, rerender } = renderHook(
      ({ isoDate }: { isoDate: string | null }) => useAppointmentsByDate(isoDate),
      { wrapper, initialProps: { isoDate: null } },
    );

    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
    expect(result.current.appointments).toEqual([]);

    rerender({ isoDate: '2026-06-09' });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
    expect(result.current.appointments).toHaveLength(1);
  });

  it('re-fetches when isoDate changes from one date to another', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: [mockAppointment({ uuid: 'day1' })] } as FetchResponse)
      .mockResolvedValueOnce({ data: [mockAppointment({ uuid: 'day2' })] } as FetchResponse);

    const { result, rerender } = renderHook(({ isoDate }: { isoDate: string }) => useAppointmentsByDate(isoDate), {
      wrapper,
      initialProps: { isoDate: '2026-06-09' },
    });

    await waitFor(() => expect(result.current.appointments[0]?.uuid).toBe('day1'));

    rerender({ isoDate: '2026-06-10' });

    await waitFor(() => expect(result.current.appointments[0]?.uuid).toBe('day2'));
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2);
  });

  it('URL-encodes the date parameter', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);

    renderHook(() => useAppointmentsByDate('2026-06-09'), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    const url = mockOpenmrsFetch.mock.calls[0][0] as string;
    expect(url).toContain('%3A');
  });
});
