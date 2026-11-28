import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, getDefaultCalendar, openmrsFetch } from '@openmrs/esm-framework';
import { useAppointmentsCalendar } from './useAppointmentsCalendar';

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getDefaultCalendar: vi.fn(),
}));

const mockGetDefaultCalendar = vi.mocked(getDefaultCalendar);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map(), shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

const requestedRange = async () => {
  await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalled());
  const url = new URL(mockOpenmrsFetch.mock.calls[0][0] as string, 'http://localhost');
  return [url.searchParams.get('startDate'), url.searchParams.get('endDate')];
};

describe('useAppointmentsCalendar', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);
  });

  it('asks for the Gregorian month that contains the date', async () => {
    mockGetDefaultCalendar.mockReturnValue('gregory');

    renderHook(() => useAppointmentsCalendar('2026-06-15', 'monthly'), { wrapper });

    const [startDate, endDate] = await requestedRange();
    expect(startDate).toMatch(/^2026-06-01T00:00:00/);
    expect(endDate).toMatch(/^2026-06-30T23:59:59/);
  });

  it('asks for the Ethiopic month that contains the date when the locale uses the Ethiopic calendar', async () => {
    mockGetDefaultCalendar.mockReturnValue('ethiopic');

    renderHook(() => useAppointmentsCalendar('2026-06-15', 'monthly'), { wrapper });

    // Sene 2018 runs from 8 June to 7 July 2026
    const [startDate, endDate] = await requestedRange();
    expect(startDate).toMatch(/^2026-06-08T00:00:00/);
    expect(endDate).toMatch(/^2026-07-07T23:59:59/);
  });

  it('asks for a single day in the daily view, whatever the calendar', async () => {
    mockGetDefaultCalendar.mockReturnValue('ethiopic');

    renderHook(() => useAppointmentsCalendar('2026-06-15', 'daily'), { wrapper });

    const [startDate, endDate] = await requestedRange();
    expect(startDate).toMatch(/^2026-06-15T00:00:00/);
    expect(endDate).toMatch(/^2026-06-15T23:59:59/);
  });
});
