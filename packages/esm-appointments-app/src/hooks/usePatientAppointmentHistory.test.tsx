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
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as any);
    mockUseSelectedDate.mockReturnValue('2026-04-01');
  });

  it('fetches separately when patient and date values change', async () => {
    const { rerender } = renderHook(({ patientUuid }) => usePatientAppointmentHistory(patientUuid), {
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
  });
});
