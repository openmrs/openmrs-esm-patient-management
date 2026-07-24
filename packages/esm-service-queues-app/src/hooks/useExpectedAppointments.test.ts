import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import useSWR from 'swr';
import { useExpectedAppointments } from './useExpectedAppointments';

vi.mock('swr', () => ({ default: vi.fn() }));

const mockUseSWR = vi.mocked(useSWR);

const appointments = [
  {
    uuid: 'a',
    patient: { uuid: 'p1', name: 'Later' },
    location: { uuid: 'loc-1' },
    startDateTime: 2000,
    status: 'Scheduled',
  },
  {
    uuid: 'b',
    patient: { uuid: 'p2', name: 'Earlier' },
    location: { uuid: 'loc-1' },
    startDateTime: 1000,
    status: 'Scheduled',
  },
  {
    uuid: 'c',
    patient: { uuid: 'p3', name: 'Other room' },
    location: { uuid: 'loc-2' },
    startDateTime: 1500,
    status: 'Scheduled',
  },
];

describe('useExpectedAppointments', () => {
  beforeEach(() => {
    mockUseSWR.mockReturnValue({
      data: { data: appointments },
      error: undefined,
      isLoading: false,
    } as ReturnType<typeof useSWR>);
  });

  it("requests today's appointments via the appointment-scheduling endpoint", () => {
    renderHook(() => useExpectedAppointments('loc-1'));
    const url = mockUseSWR.mock.calls[0][0] as string;
    expect(url).toContain('/appointments?forDate=');
  });

  it('filters to the selected location and sorts by start time', () => {
    const { result } = renderHook(() => useExpectedAppointments('loc-1'));
    expect(result.current.appointments.map((a) => a.uuid)).toEqual(['b', 'a']);
  });

  it('returns all appointments (sorted) when no location is selected', () => {
    const { result } = renderHook(() => useExpectedAppointments(undefined));
    expect(result.current.appointments.map((a) => a.uuid)).toEqual(['b', 'c', 'a']);
  });

  it('passes through the error so callers can distinguish failure from an empty day', () => {
    const error = new Error('network');
    mockUseSWR.mockReturnValue({ data: undefined, error, isLoading: false } as ReturnType<typeof useSWR>);
    const { result } = renderHook(() => useExpectedAppointments('loc-1'));
    expect(result.current.error).toBe(error);
    expect(result.current.appointments).toEqual([]);
  });
});
