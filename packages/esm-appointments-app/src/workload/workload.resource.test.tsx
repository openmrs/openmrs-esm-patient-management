import React from 'react';
import { vi, describe, it, expect, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useMonthlyAppointmentSummary } from './workload.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>{children}</SWRConfig>
);

describe('useMonthlyAppointmentSummary', () => {
  afterEach(() => {
    process.env.TZ = 'UTC';
  });

  it.each([
    ['Africa/Nairobi', '2026-11-30T21:00:00.000Z', '2026-12-31T20:59:59.999Z'],
    ['America/New_York', '2026-12-01T05:00:00.000Z', '2027-01-01T04:59:59.999Z'],
  ])('sends the local month in %s as UTC instants', async (timeZone, startDate, endDate) => {
    process.env.TZ = timeZone;
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as FetchResponse);

    renderHook(() => useMonthlyAppointmentSummary(new Date(2026, 11, 15), 'service-uuid'), { wrapper });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    expect(mockOpenmrsFetch.mock.calls[0][0]).toBe(
      `${restBaseUrl}/appointment/appointmentSummary?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
    );
  });
});
