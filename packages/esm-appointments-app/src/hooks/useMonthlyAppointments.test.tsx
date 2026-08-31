import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import dayjs from 'dayjs';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMonthlyAppointments } from './useMonthlyAppointments';

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

describe('useMonthlyAppointments', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('returns empty appointments without fetching when forDate is null', () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);

    const { result } = renderHook(() => useMonthlyAppointments(null), { wrapper });

    expect(result.current.appointments).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });

  it('fetches all days in the month using the GET /appointments?forDate= endpoint', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);

    renderHook(() => useMonthlyAppointments(dayjs('2026-08-15')), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(31));
    const urls: Array<string> = mockOpenmrsFetch.mock.calls.map(([url]) => url as string);
    expect(urls[0]).toContain(`${restBaseUrl}/appointments?forDate=`);
    expect(urls[0]).toContain('2026-08-01');
    expect(urls[30]).toContain('2026-08-31');
  });

  it('deduplicates recurring appointments and sorts by startDateTime', async () => {
    const early = mockAppointment({ uuid: 'early', startDateTime: new Date('2026-08-05T09:00:00').getTime() });
    const late = mockAppointment({ uuid: 'late', startDateTime: new Date('2026-08-25T14:00:00').getTime() });
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: [late, early] } as FetchResponse)
      .mockResolvedValueOnce({ data: [early] } as FetchResponse)
      .mockResolvedValue({ data: [] } as FetchResponse);

    const { result } = renderHook(() => useMonthlyAppointments(dayjs('2026-08-15')), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.appointments.map((a) => a.uuid)).toEqual(['early', 'late']);
  });

  it('re-fetches when the month changes', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({
        data: [mockAppointment({ uuid: 'aug', startDateTime: new Date('2026-08-10').getTime() })],
      } as FetchResponse)
      .mockResolvedValue({ data: [] } as FetchResponse);

    const { result, rerender } = renderHook(
      ({ forDate }: { forDate: ReturnType<typeof dayjs> }) => useMonthlyAppointments(forDate),
      {
        wrapper,
        initialProps: { forDate: dayjs('2026-08-15') },
      },
    );

    await waitFor(() => expect(result.current.appointments.some((a) => a.uuid === 'aug')).toBe(true));

    mockOpenmrsFetch.mockReset();
    mockOpenmrsFetch
      .mockResolvedValueOnce({
        data: [mockAppointment({ uuid: 'sep', startDateTime: new Date('2026-09-10').getTime() })],
      } as FetchResponse)
      .mockResolvedValue({ data: [] } as FetchResponse);

    rerender({ forDate: dayjs('2026-09-15') });

    await waitFor(() => expect(result.current.appointments.some((a) => a.uuid === 'sep')).toBe(true));
  });

  it('surfaces the error when the fetch fails', async () => {
    mockOpenmrsFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMonthlyAppointments(dayjs('2026-08-15')), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
    expect(result.current.appointments).toEqual([]);
  });
});
