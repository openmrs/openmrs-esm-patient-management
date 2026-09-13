import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { mockMappedAppointmentsData, mockUseAppointmentServiceData } from '__mocks__';
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

const outpatientService = mockUseAppointmentServiceData[0];
const hivService = mockMappedAppointmentsData.data[0];

const mockSummaryData = [
  {
    appointmentService: {
      name: outpatientService.name,
      uuid: outpatientService.uuid,
    },
    appointmentCountMap: {
      '2026-08-10': { allAppointmentsCount: 4 },
      '2026-08-12': { allAppointmentsCount: 2 },
    },
  },
  {
    appointmentService: {
      name: hivService.serviceType,
      uuid: hivService.serviceUuid,
    },
    appointmentCountMap: {
      '2026-08-10': { allAppointmentsCount: 1 },
      '2026-08-15': { allAppointmentsCount: 3 },
    },
  },
];

describe('useAppointmentsCalendar', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('fetches appointmentSummary with only startDate and endDate parameters in 1 API call', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: mockSummaryData } as FetchResponse);

    const { result } = renderHook(() => useAppointmentsCalendar('2026-08-15', 'monthly'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockOpenmrsFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain(`${restBaseUrl}/appointment/appointmentSummary?`);
    expect(calledUrl).toContain('startDate=2026-08-01');
    expect(calledUrl).toContain('endDate=2026-08-31');
    expect(calledUrl).not.toContain('serviceUuids');
    expect(calledUrl).not.toContain('providerUuids');
    expect(calledUrl).not.toContain('locationUuids');
  });

  it('returns all services when no service filter is active', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: mockSummaryData } as FetchResponse);

    const { result } = renderHook(() => useAppointmentsCalendar('2026-08-15', 'monthly'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.calendarEvents).toHaveLength(3);
    const aug10 = result.current.calendarEvents.find((e) => e.appointmentDate === '2026-08-10');
    expect(aug10?.services).toEqual([
      { serviceName: outpatientService.name, serviceUuid: outpatientService.uuid, count: 4 },
      { serviceName: hivService.serviceType, serviceUuid: hivService.serviceUuid, count: 1 },
    ]);
  });

  it('filters services client-side when selectedServiceUuids is specified', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: mockSummaryData } as FetchResponse);

    const { result } = renderHook(
      () => useAppointmentsCalendar('2026-08-15', 'monthly', { selectedServiceUuids: [outpatientService.uuid] }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.calendarEvents.forEach((event) => {
      event.services.forEach((svc) => {
        expect(svc.serviceUuid).toBe(outpatientService.uuid);
      });
    });

    const aug10 = result.current.calendarEvents.find((e) => e.appointmentDate === '2026-08-10');
    expect(aug10?.services).toEqual([
      { serviceName: outpatientService.name, serviceUuid: outpatientService.uuid, count: 4 },
    ]);
    expect(result.current.calendarEvents.find((e) => e.appointmentDate === '2026-08-15')).toBeUndefined();
  });

  it('handles null forDate by not fetching', () => {
    const { result } = renderHook(() => useAppointmentsCalendar(null, 'monthly'), { wrapper });

    expect(result.current.calendarEvents).toEqual([]);
    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });
});
