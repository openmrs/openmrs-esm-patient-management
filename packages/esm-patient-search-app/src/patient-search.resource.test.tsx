import React from 'react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useInfinitePatientSearch } from './patient-search.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const queryOf = (url: string) => new URL(url, 'http://localhost').searchParams.get('q') ?? '';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
);

const pageOfResults = (query: string) =>
  Promise.resolve({
    data: {
      results: Array.from({ length: 10 }, (_, i) => ({
        uuid: `${query}-${i}`,
        person: { personName: { display: query } },
      })),
      links: [{ rel: 'next' }],
      totalCount: 100,
    },
  } as unknown as FetchResponse);

describe('useInfinitePatientSearch', () => {
  beforeEach(() => {
    vi.useRealTimers();
    mockOpenmrsFetch.mockReset();
    mockOpenmrsFetch.mockImplementation((url: string) => pageOfResults(queryOf(url)));
  });

  // Regression test for O3-5714: without `keepPreviousData`, a query change resets
  // `data` to undefined while the new request is in flight, which made the view
  // swap in its loading skeleton and unmount/remount the entire banner list on
  // every keystroke. With `keepPreviousData`, the prior results stay in `data`
  // until the new ones arrive, so the banner subtree is never torn down.
  it('keeps the previously loaded results while a new query is being fetched', async () => {
    const { result, rerender } = renderHook(({ q }: { q: string }) => useInfinitePatientSearch(q, false, true, 10), {
      wrapper,
      initialProps: { q: 'Jo' },
    });

    await waitFor(() => expect(result.current.data).toHaveLength(10));
    expect(result.current.data?.[0].uuid).toBe('Jo-0');

    // The next query's request never resolves, so the only way `data` can stay
    // populated is `keepPreviousData` holding onto the previous results.
    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}));
    rerender({ q: 'Jos' });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(result.current.data).toHaveLength(10);
    expect(result.current.data?.[0].uuid).toBe('Jo-0');
  });
});
