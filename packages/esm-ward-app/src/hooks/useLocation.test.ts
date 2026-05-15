import useSWRImmutable from 'swr/immutable';
import { vi, describe, it, expect, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { restBaseUrl } from '@openmrs/esm-framework';
import useLocation from './useLocation';

vi.mock('swr/immutable', () => ({
  default: vi.fn().mockReturnValue({
    data: {},
    error: null,
    isValidating: false,
    mutate: vi.fn(),
  }),
}));

const useSWRImmutableMock = useSWRImmutable as Mock;

describe('useLocation hook', () => {
  it('should call useLocation', () => {
    const { result } = renderHook(() => useLocation('testUUID'));
    expect(useSWRImmutableMock).toHaveBeenCalledWith(
      `${restBaseUrl}/location/testUUID?v=custom:(display,uuid)`,
      expect.any(Function),
    );
  });

  it('should call useLocation with the given custom representation', () => {
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
