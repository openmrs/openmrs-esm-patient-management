import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { usePatientAppointments } from './queue-linelist.resource';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

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

describe('usePatientAppointments', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as any);
  });

  it('fetches separately when both patientUuid and startDate change', async () => {
    const futureDate = new Date('2099-01-01').getTime();
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [{ status: 'Scheduled', startDateTime: futureDate }] } as any);

    const { rerender, result } = renderHook(
      ({ patientUuid, startDate }) => usePatientAppointments(patientUuid, startDate),
      {
        wrapper,
        initialProps: {
          patientUuid: 'patient-1',
          startDate: '2026-04-01',
        },
      },
    );

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      1,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          patientUuid: 'patient-1',
          startDate: '2026-04-01',
        }),
      }),
    );
    expect(result.current.upcomingAppointment).toBeFalsy();

    rerender({ patientUuid: 'patient-2', startDate: '2026-04-02' });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      2,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({
          patientUuid: 'patient-2',
          startDate: '2026-04-02',
        }),
      }),
    );
    // Data must reflect patient-2's response, not patient-1's cached empty data
    await waitFor(() => expect(result.current.upcomingAppointment).toBeTruthy());
  });

  it('triggers a new fetch and returns fresh data when only patientUuid changes', async () => {
    // patient-1 returns empty; patient-2 returns one upcoming appointment
    const futureDate = new Date('2099-01-01').getTime();
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [{ status: 'Scheduled', startDateTime: futureDate }] } as any);

    const { rerender, result } = renderHook(
      ({ patientUuid, startDate }) => usePatientAppointments(patientUuid, startDate),
      {
        wrapper,
        initialProps: { patientUuid: 'patient-1', startDate: '2026-04-01' },
      },
    );

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    // patient-1 has no upcoming appointment
    expect(result.current.upcomingAppointment).toBeFalsy();

    // Change only the patient – startDate remains '2026-04-01'
    rerender({ patientUuid: 'patient-2', startDate: '2026-04-01' });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      2,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        body: expect.objectContaining({ patientUuid: 'patient-2', startDate: '2026-04-01' }),
      }),
    );
    // Result must reflect patient-2's data, not patient-1's cached null
    await waitFor(() => expect(result.current.upcomingAppointment).not.toBeNull());
  });

  it('triggers a new fetch when only startDate changes', async () => {
    const futureDate = new Date('2099-01-01').getTime();
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [{ status: 'Scheduled', startDateTime: futureDate }] } as any);

    const { rerender, result } = renderHook(
      ({ patientUuid, startDate }) => usePatientAppointments(patientUuid, startDate),
      {
        wrapper,
        initialProps: { patientUuid: 'patient-1', startDate: '2026-04-01' },
      },
    );

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      1,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        body: expect.objectContaining({ patientUuid: 'patient-1', startDate: '2026-04-01' }),
      }),
    );
    expect(result.current.upcomingAppointment).toBeFalsy();

    // Change only the startDate – patientUuid remains 'patient-1'
    rerender({ patientUuid: 'patient-1', startDate: '2026-04-15' });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      2,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        body: expect.objectContaining({ patientUuid: 'patient-1', startDate: '2026-04-15' }),
      }),
    );
    // Data must reflect the new date's response, not the first date's cached data
    await waitFor(() => expect(result.current.upcomingAppointment).toBeTruthy());
  });

  it('does not fetch again when patientUuid and startDate are unchanged (cache hit)', async () => {
    const { rerender } = renderHook(({ patientUuid, startDate }) => usePatientAppointments(patientUuid, startDate), {
      wrapper,
      initialProps: { patientUuid: 'patient-1', startDate: '2026-04-01' },
    });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));

    // Rerender with identical inputs – SWR key is unchanged, must serve from cache
    rerender({ patientUuid: 'patient-1', startDate: '2026-04-01' });

    // Flush pending microtasks then assert no second fetch was triggered
    await waitFor(() => {});
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
  });
});
