import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { usePatientAppointments } from './patient-appointments.resource';

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
  let abortController: AbortController;

  beforeEach(() => {
    abortController = new AbortController();
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as any);
  });

  it('fetches separately when patient and date values change', async () => {
    const { rerender } = renderHook(
      ({ patientUuid, startDate }) => usePatientAppointments(patientUuid, startDate, abortController),
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
  });
});
