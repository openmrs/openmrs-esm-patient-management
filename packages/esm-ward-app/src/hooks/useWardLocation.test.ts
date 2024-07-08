import { renderHook } from '@testing-library/react';
import { useSession } from '@openmrs/esm-framework';
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

const mockedUseParams = useParams as jest.Mock;
const mockedUseSession = useSession as jest.Mock;
const mockedUseLocation = useLocation as jest.Mock;

describe('useWardLocation', () => {
  it('returns session location when locationUuidFromUrl is not provided', async () => {
    mockedUseParams.mockReturnValue({});
    mockedUseSession.mockReturnValue({ sessionLocation: 'sessionLocation' });
    mockedUseLocation.mockReturnValue({});

    const { result } = renderHook(() => useWardLocation());

    expect(result.current.location).toBe('sessionLocation');
  });

  it('returns location from useLocation when locationUuidFromUrl is provided', async () => {
    mockedUseParams.mockReturnValue({ locationUuid: 'uuid' });
    mockedUseLocation.mockReturnValue({
      data: { data: 'locationData' },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useWardLocation());

    expect(result.current.location).toBe('locationData');
    expect(result.current.invalidLocation).toBeFalsy();
  });

  it('handles loading state correctly', async () => {
    mockedUseParams.mockReturnValue({ locationUuid: 'uuid' });
    mockedUseLocation.mockReturnValue({
      isLoading: true,
    });

    const { result } = renderHook(() => useWardLocation());

    expect(result.current.isLoadingLocation).toBe(true);
  });

  it('handles error state correctly when fetching location fails', async () => {
    const error = new Error('Error fetching location');
    mockedUseParams.mockReturnValue({ locationUuid: 'uuid' });
    mockedUseLocation.mockReturnValue({
      error,
    });

    const { result } = renderHook(() => useWardLocation());

    expect(result.current.errorFetchingLocation).toBe(error);
  });

  it('identifies invalid location correctly', async () => {
    const error = new Error('Error fetching location');
    mockedUseParams.mockReturnValue({ locationUuid: 'uuid' });
    mockedUseLocation.mockReturnValue({
      error,
    });

    const { result } = renderHook(() => useWardLocation());

    expect(result.current.invalidLocation).toBeTruthy();
  });
});
