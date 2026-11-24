import React from 'react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useAppointmentsCalendar } from './useAppointmentsCalendar';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
);

const summaryUrl = (startDate: string, endDate: string) =>
  `${restBaseUrl}/appointment/appointmentSummary?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;

describe('useAppointmentsCalendar', () => {
  afterEach(() => {
    process.env.TZ = 'UTC';
  });

  it.each([
    ['daily', '2026-12-14T21:00:00.000Z', '2026-12-15T20:59:59.999Z'],
    ['monthly', '2026-11-30T21:00:00.000Z', '2026-12-31T20:59:59.999Z'],
  ])('sends the %s range in the local time zone as UTC instants', async (period, startDate, endDate) => {
    process.env.TZ = 'Africa/Nairobi';
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);

    renderHook(() => useAppointmentsCalendar('2026-12-15', period), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    expect(mockOpenmrsFetch.mock.calls[0][0]).toBe(summaryUrl(startDate, endDate));
  });

  it('sends the daily range in a time zone behind UTC as UTC instants', async () => {
    process.env.TZ = 'America/New_York';
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);

    renderHook(() => useAppointmentsCalendar('2026-12-15', 'daily'), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    expect(mockOpenmrsFetch.mock.calls[0][0]).toBe(summaryUrl('2026-12-15T05:00:00.000Z', '2026-12-16T04:59:59.999Z'));
  });
});
