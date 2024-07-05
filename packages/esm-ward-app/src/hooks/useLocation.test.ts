import { renderHook } from '@testing-library/react';
import useLocation from './useLocation';
import useSWRImmutable from 'swr/immutable';
import { restBaseUrl } from '@openmrs/esm-framework';

jest.mock('swr/immutable', () =>
  jest.fn().mockReturnValue({
    data: {},
    error: null,
    isValidating: false,
    mutate: jest.fn(),
  }),
);

const useSWRImmutableMock = useSWRImmutable as jest.Mock;

describe('useLocation hook', () => {
  it('should call useLocation', () => {
    const { result } = renderHook(() => useLocation('testUUID'));
    expect(useSWRImmutableMock).toHaveBeenCalledWith(
      `${restBaseUrl}/location/testUUID?v=custom:(display,uuid)`,
      expect.any(Function),
    );
  });

  it('should call useLocation with given rep', () => {
    const { result } = renderHook(() => useLocation('testUUID', 'custom:(display,uuid,links)'));
    expect(useSWRImmutableMock).toHaveBeenCalledWith(
      `${restBaseUrl}/location/testUUID?v=custom:(display,uuid,links)`,
      expect.any(Function),
    );
  });

  it('should call useSWR with key=null', () => {
    const { result } = renderHook(() => useLocation(null, 'custom:(display,uuid,links)'));
    expect(useSWRImmutableMock).toHaveBeenCalledWith(null, expect.any(Function));
  });
});
