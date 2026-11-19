import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { mockAppointmentsData } from '__mocks__';
import { useAppointmentList } from './useAppointmentList';

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

const requestError = new Error('Internal Server Error');

describe('useAppointmentList', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('reports a load error when the first request for a date fails', async () => {
    mockOpenmrsFetch.mockRejectedValueOnce(requestError);

    const { result } = renderHook(() => useAppointmentList('2026-08-14'), { wrapper });

    await waitFor(() => expect(result.current.loadError).toBe(requestError));
    expect(result.current.appointmentList).toEqual([]);
  });

  it.each([
    ['a day with appointments', mockAppointmentsData.data],
    ['a day with no appointments', []],
  ])('does not report a load error when a refresh fails after %s has loaded', async (_, appointments) => {
    mockOpenmrsFetch.mockResolvedValueOnce({ data: appointments } as unknown as FetchResponse);

    const { result } = renderHook(() => useAppointmentList('2026-08-14'), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    mockOpenmrsFetch.mockRejectedValueOnce(requestError);
    await act(async () => {
      await result.current.mutate();
    });

    // The failed refresh is still visible to callers that want it
    await waitFor(() => expect(result.current.error).toBe(requestError));
    expect(result.current.loadError).toBeUndefined();
    expect(result.current.appointmentList).toEqual(appointments);
  });
});
