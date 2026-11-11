import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { useAppointmentsCalendar } from './useAppointmentsCalendar';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const inpatientWardUuid = 'b1a8b05e-3542-4037-bbd3-998ee9c40574';
const outpatientClinicUuid = '44c3efb0-2583-4c80-a79e-1f756a03c0a1';
const hivClinic = { uuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1', name: 'HIV Clinic' };
const outpatient = { uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90', name: 'Outpatient' };

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
  uuid: '3b4d4f2a-7c8d-4e1f-9a6b-5c8d2e1f4a7b',
  location: { uuid: inpatientWardUuid, name: 'Inpatient Ward' },
  service: hivClinic,
  startDateTime: new Date('2026-06-09T09:00:00').getTime(),
  status: 'Scheduled',
  ...overrides,
});

describe('useAppointmentsCalendar', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('reads the daily counts from the appointment summary when no location is selected', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [{ appointmentService: hivClinic, appointmentCountMap: { '2026-06-09': { allAppointmentsCount: 4 } } }],
    } as FetchResponse);

    const { result } = renderHook(() => useAppointmentsCalendar('2026-06-09', 'monthly', []), { wrapper });

    await waitFor(() =>
      expect(result.current.calendarEvents).toEqual([
        {
          appointmentDate: '2026-06-09',
          services: [{ serviceName: 'HIV Clinic', serviceUuid: hivClinic.uuid, count: 4 }],
        },
      ]),
    );
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
    expect(mockOpenmrsFetch.mock.calls[0][0]).toContain(
      `${restBaseUrl}/appointment/appointmentSummary?startDate=2026-06-01`,
    );
  });

  it('counts the appointments at the selected locations by day and by service', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [
        mockAppointment(),
        mockAppointment({ startDateTime: new Date('2026-06-09T14:30:00').getTime() }),
        mockAppointment({ service: outpatient }),
        mockAppointment({ startDateTime: new Date('2026-06-10T09:00:00').getTime() }),
        mockAppointment({ status: 'Cancelled' }),
        mockAppointment({ location: { uuid: outpatientClinicUuid, name: 'Outpatient Clinic' } }),
      ],
    } as FetchResponse);

    const { result } = renderHook(() => useAppointmentsCalendar('2026-06-09', 'monthly', [inpatientWardUuid]), {
      wrapper,
    });

    await waitFor(() =>
      expect(result.current.calendarEvents).toEqual([
        {
          appointmentDate: '2026-06-09',
          services: [
            { serviceName: 'HIV Clinic', serviceUuid: hivClinic.uuid, count: 2 },
            { serviceName: 'Outpatient', serviceUuid: outpatient.uuid, count: 1 },
          ],
        },
        {
          appointmentDate: '2026-06-10',
          services: [{ serviceName: 'HIV Clinic', serviceUuid: hivClinic.uuid, count: 1 }],
        },
      ]),
    );

    const [url, options] = mockOpenmrsFetch.mock.calls[0];
    expect(url).toBe(`${restBaseUrl}/appointments/search`);
    expect(options).toMatchObject({
      method: 'POST',
      body: {
        startDate: expect.stringContaining('2026-06-01T00:00:00'),
        endDate: expect.stringContaining('2026-06-30T23:59:59'),
      },
    });
  });

  it('re-filters the appointments it already has when the selected locations change', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [
        mockAppointment(),
        mockAppointment({ location: { uuid: outpatientClinicUuid, name: 'Outpatient Clinic' } }),
      ],
    } as FetchResponse);

    const { result, rerender } = renderHook(
      ({ locationUuids }) => useAppointmentsCalendar('2026-06-09', 'monthly', locationUuids),
      { wrapper, initialProps: { locationUuids: [inpatientWardUuid] } },
    );

    await waitFor(() => expect(result.current.calendarEvents[0]?.services[0].count).toBe(1));

    rerender({ locationUuids: [inpatientWardUuid, outpatientClinicUuid] });

    expect(result.current.calendarEvents[0].services[0].count).toBe(2);
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
  });
});
