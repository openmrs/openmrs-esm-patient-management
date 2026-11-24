import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useAppointmentsCalendar } from './useAppointmentsCalendar';

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

describe('useAppointmentsCalendar', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);
  });

  it('does not fetch when no date is given', () => {
    const { result } = renderHook(() => useAppointmentsCalendar(null, 'monthly'), { wrapper });

    expect(result.current.calendarEvents).toEqual([]);
    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });

  it('requests the appointment summary for the month without filter params by default', async () => {
    renderHook(() => useAppointmentsCalendar('2026-06-09', 'monthly'), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    const url = mockOpenmrsFetch.mock.calls[0][0] as string;
    expect(url).toContain(`${restBaseUrl}/appointment/appointmentSummary?startDate=2026-06-01`);
    expect(url).toContain('endDate=2026-06-30');
    expect(url).not.toContain('providerUuids');
    expect(url).not.toContain('serviceUuids');
  });

  it('adds one providerUuids param per selected provider', async () => {
    renderHook(
      () => useAppointmentsCalendar('2026-06-09', 'monthly', { providerUuids: ['provider-a', 'provider-b'] }),
      { wrapper },
    );

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    const url = mockOpenmrsFetch.mock.calls[0][0] as string;
    expect(url).toContain('&providerUuids=provider-a&providerUuids=provider-b');
  });

  it('omits the providerUuids param when the selection is empty', async () => {
    renderHook(() => useAppointmentsCalendar('2026-06-09', 'daily', { providerUuids: [] }), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    const url = mockOpenmrsFetch.mock.calls[0][0] as string;
    expect(url).not.toContain('providerUuids');
  });

  it('adds one serviceUuids param per selected service', async () => {
    renderHook(() => useAppointmentsCalendar('2026-06-09', 'monthly', { serviceUuids: ['service-a', 'service-b'] }), {
      wrapper,
    });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    const url = mockOpenmrsFetch.mock.calls[0][0] as string;
    expect(url).toContain('&serviceUuids=service-a&serviceUuids=service-b');
    expect(url).not.toContain('providerUuids');
  });

  it('omits the serviceUuids param when the selection is empty', async () => {
    renderHook(() => useAppointmentsCalendar('2026-06-09', 'daily', { serviceUuids: [] }), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    expect(mockOpenmrsFetch.mock.calls[0][0]).not.toContain('serviceUuids');
  });

  it('re-fetches when the provider filter changes', async () => {
    const { rerender } = renderHook(
      ({ providerUuids }: { providerUuids: Array<string> }) =>
        useAppointmentsCalendar('2026-06-09', 'monthly', { providerUuids }),
      { wrapper, initialProps: { providerUuids: [] } },
    );

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));

    rerender({ providerUuids: ['provider-a'] });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(mockOpenmrsFetch.mock.calls[1][0]).toContain('providerUuids=provider-a');
  });
});
