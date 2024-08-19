import { renderHook } from '@testing-library/react';
import { type FetchResponse, useSession } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { useParams } from 'react-router-dom';
import useWardLocation from './useWardLocation';
import useLocation from './useLocation';

jest.mock('@openmrs/esm-framework', () => ({
  useSession: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));
jest.mock('./useLocation', () => jest.fn());

const mockUseParams = jest.mocked(useParams);
const mockUseSession = jest.mocked(useSession);
const mockUseLocation = useLocation as jest.Mock;

describe('useWardLocation', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession.data);
  });

  it('returns session location when locationUuidFromUrl is not provided', async () => {
    mockUseParams.mockReturnValue({});
    mockUseLocation.mockReturnValue({
      data: null,
      error: null,
      isLoading: null,
      isValidating: null,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWardLocation());
    expect(result.current.location).toBe(mockSession.data.sessionLocation);
  });

  it('returns location from useLocation when locationUuidFromUrl is provided', async () => {
    mockUseParams.mockReturnValue({ locationUuid: 'some-location-uuid' });
    mockUseLocation.mockReturnValue({
      data: {
        data: {
          display: 'Test Location',
          name: 'Test Location',
          uuid: 'test-location-uuid',
        },
      },
      error: null,
      isLoading: false,
      isValidating: null,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWardLocation());

    expect(result.current.location).toEqual({
      display: 'Test Location',
      name: 'Test Location',
      uuid: 'test-location-uuid',
    });
    expect(result.current.invalidLocation).toBeFalsy();
  });

  it('handles loading state correctly', async () => {
    mockUseParams.mockReturnValue({ locationUuid: 'uuid' });
    mockUseLocation.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
      isValidating: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWardLocation());
    expect(result.current.isLoadingLocation).toBe(true);
  });

  it('handles error state correctly when fetching location fails', async () => {
    const error = new Error('Error fetching location');
    mockUseParams.mockReturnValue({ locationUuid: 'uuid' });
    mockUseLocation.mockReturnValue({
      data: null,
      error,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWardLocation());
    expect(result.current.errorFetchingLocation).toBe(error);
  });

  it('identifies invalid location correctly', async () => {
    const error = new Error('Error fetching location');
    mockUseParams.mockReturnValue({ locationUuid: 'uuid' });
    mockUseLocation.mockReturnValue({
      data: null,
      error,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWardLocation());
    expect(result.current.invalidLocation).toBeTruthy();
  });
});
