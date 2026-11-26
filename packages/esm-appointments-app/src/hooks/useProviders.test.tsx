import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { restBaseUrl, useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { useProviders } from './useProviders';

const mockUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);

const provider = (n: number) => ({ uuid: `provider-${n}`, display: `doctor - Provider ${n}` });

function fetchAllResult(data: Array<unknown> | undefined, isLoading = false) {
  return {
    data,
    error: undefined,
    isLoading,
    isValidating: false,
    hasMore: false,
    loadMore: vi.fn(),
    nextUri: null,
    mutate: vi.fn(),
    totalCount: data?.length ?? 0,
  } as unknown as ReturnType<typeof useOpenmrsFetchAll>;
}

describe('useProviders', () => {
  beforeEach(() => {
    mockUseOpenmrsFetchAll.mockReset();
  });

  it('loads every page of providers with a slim representation', () => {
    mockUseOpenmrsFetchAll.mockReturnValue(fetchAllResult([provider(1), provider(2)]));

    const { result } = renderHook(() => useProviders());

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalledWith(
      `${restBaseUrl}/provider?v=custom:(uuid,display,person:(uuid,display))`,
    );
    expect(result.current.providers).toEqual([provider(1), provider(2)]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns an empty list while the pages are still loading', () => {
    mockUseOpenmrsFetchAll.mockReturnValue(fetchAllResult(undefined, true));

    const { result } = renderHook(() => useProviders());

    expect(result.current.providers).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });
});
