import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { usePatientAppointmentHistory } from './usePatientAppointmentHistory';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

jest.mock('./useSelectedDate', () => ({
  useSelectedDate: jest.fn(),
}));

import { useSelectedDate } from './useSelectedDate';

const mockUseSelectedDate = jest.mocked(useSelectedDate);

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

describe('usePatientAppointmentHistory', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as any);
    mockUseSelectedDate.mockReturnValue('2026-04-01');
  });

  it('fetches separately when both patientUuid and selectedDate change', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [{ status: 'Missed', startDateTime: Date.now() }] } as any);

    const { rerender, result } = renderHook(({ patientUuid }) => usePatientAppointmentHistory(patientUuid), {
      wrapper,
      initialProps: { patientUuid: 'patient-1' },
    });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      1,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ patientUuid: 'patient-1', startDate: '2026-04-01' }),
      }),
    );
    expect(result.current.appointmentsCount.missedAppointments).toBe(0);

  mockUseSelectedDate.mockReturnValue('2026-04-15');
    rerender({ patientUuid: 'patient-2' });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      2,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        method: 'POST',
        body: expect.objectContaining({ patientUuid: 'patient-2', startDate: '2026-04-15' }),
      }),
    );
    // Data must reflect patient-2's response, not patient-1's cached empty data
    await waitFor(() => expect(result.current.appointmentsCount.missedAppointments).toBe(1));
  });

  it('triggers a new fetch and returns fresh data when only patientUuid changes', async () => {
    // patient-1 returns empty; patient-2 returns one Missed appointment
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [{ status: 'Missed', startDateTime: Date.now() }] } as any);

    const { rerender, result } = renderHook(({ patientUuid }) => usePatientAppointmentHistory(patientUuid), {
      wrapper,
      initialProps: { patientUuid: 'patient-1' },
    });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    // patient-1 has no missed appointments
    expect(result.current.appointmentsCount.missedAppointments).toBe(0);

    // Change only the patient – selectedDate remains '2026-04-01'
    rerender({ patientUuid: 'patient-2' });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      2,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        body: expect.objectContaining({ patientUuid: 'patient-2', startDate: '2026-04-01' }),
      }),
    );
    // Result must reflect patient-2's data, not patient-1's cached empty data
    await waitFor(() => expect(result.current.appointmentsCount.missedAppointments).toBe(1));
  });

  it('triggers a new fetch when only selectedDate changes', async () => {
    mockOpenmrsFetch
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [{ status: 'Completed', startDateTime: Date.now() }] } as any);

    const { rerender, result } = renderHook(({ patientUuid }) => usePatientAppointmentHistory(patientUuid), {
      wrapper,
      initialProps: { patientUuid: 'patient-1' },
    });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      1,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        body: expect.objectContaining({ patientUuid: 'patient-1', startDate: '2026-04-01' }),
      }),
    );
    expect(result.current.appointmentsCount.completedAppointments).toBe(0);

    // Change only the selected date – patientUuid remains 'patient-1'
    mockUseSelectedDate.mockReturnValue('2026-04-15');
    rerender({ patientUuid: 'patient-1' });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(2));
    expect(mockOpenmrsFetch).toHaveBeenNthCalledWith(
      2,
      `${restBaseUrl}/appointments/search`,
      expect.objectContaining({
        body: expect.objectContaining({ patientUuid: 'patient-1', startDate: '2026-04-15' }),
      }),
    );
    // Data must reflect the new date's response, not the first date's cached empty data
    await waitFor(() => expect(result.current.appointmentsCount.completedAppointments).toBe(1));
  });

  it('does not fetch again when patientUuid and selectedDate are unchanged (cache hit)', async () => {
    const { rerender } = renderHook(({ patientUuid }) => usePatientAppointmentHistory(patientUuid), {
      wrapper,
      initialProps: { patientUuid: 'patient-1' },
    });

    await waitFor(() => expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1));

    // Rerender with identical inputs – SWR key is unchanged, must serve from cache
    rerender({ patientUuid: 'patient-1' });

    // Flush pending microtasks then assert no second fetch was triggered
    await waitFor(() => {});
    expect(mockOpenmrsFetch).toHaveBeenCalledTimes(1);
  });
});
