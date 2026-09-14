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

const minSearchCharactersResponse = () =>
  Promise.resolve({
    data: { results: [{ property: 'minSearchCharacters', value: '2' }] },
  } as unknown as FetchResponse);

describe('useInfinitePatientSearch', () => {
  beforeEach(() => {
    vi.useRealTimers();
    mockOpenmrsFetch.mockReset();
    mockOpenmrsFetch.mockImplementation((url: string) =>
      url.includes('systemsetting') ? minSearchCharactersResponse() : pageOfResults(queryOf(url)),
    );
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

  // Once the search is cleared, `keepPreviousData` keeps the last query's results in the SWR cache,
  // but the hook must not keep surfacing them: consumers size arrow-key navigation off `data`, so
  // returning stale results would let a keypress select a patient that is no longer on screen.
  it('stops surfacing results once the search is no longer active', async () => {
    const { result, rerender } = renderHook(
      ({ q, searching }: { q: string; searching: boolean }) => useInfinitePatientSearch(q, false, searching, 10),
      { wrapper, initialProps: { q: 'Jo', searching: true } },
    );

    await waitFor(() => expect(result.current.data).toHaveLength(10));
    expect(result.current.hasMore).toBe(true);
    expect(result.current.totalResults).toBe(100);

    rerender({ q: '', searching: false });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(result.current.data).toBeNull();
    expect(result.current.hasMore).toBe(false);
    expect(result.current.totalResults).toBe(0);
  });

  it('sends no request and returns no data when the query is below the configured minimum', async () => {
    const { result } = renderHook(({ q }: { q: string }) => useInfinitePatientSearch(q, false, true, 10), {
      wrapper,
      initialProps: { q: 'J' }, // 1 character, below the mocked minimum of 2
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(mockOpenmrsFetch).not.toHaveBeenCalledWith(expect.stringContaining('/patient?'), expect.anything());
    expect(result.current.data).toBeNull();
    expect(result.current.totalResults).toBe(0);
  });

  it('sends a request and returns data when the query exactly meets the configured minimum', async () => {
    const { result } = renderHook(({ q }: { q: string }) => useInfinitePatientSearch(q, false, true, 10), {
      wrapper,
      initialProps: { q: 'Jo' }, // 2 characters, exactly the mocked minimum
    });

    await waitFor(() => expect(result.current.data).toHaveLength(10));
    expect(result.current.data?.[0].uuid).toBe('Jo-0');
  });

  it('waits for the minimum character setting to finish loading before sending any request', async () => {
    // The setting request never resolves, simulating it still being in flight.
    mockOpenmrsFetch.mockImplementation((url: string) =>
      url.includes('systemsetting') ? new Promise(() => {}) : pageOfResults(queryOf(url)),
    );

    const { result } = renderHook(({ q }: { q: string }) => useInfinitePatientSearch(q, false, true, 10), {
      wrapper,
      initialProps: { q: 'Joseph' }, // well above any plausible minimum
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(mockOpenmrsFetch).not.toHaveBeenCalledWith(expect.stringContaining('/patient?'), expect.anything());
    expect(result.current.data).toBeNull();
  });

  it('hides previous results and stops further requests once the query is shortened below the minimum', async () => {
    const { result, rerender } = renderHook(({ q }: { q: string }) => useInfinitePatientSearch(q, false, true, 10), {
      wrapper,
      initialProps: { q: 'Jo' },
    });

    await waitFor(() => expect(result.current.data).toHaveLength(10));

    mockOpenmrsFetch.mockClear();
    rerender({ q: 'J' }); // shortened back down to 1 character, below the mocked minimum of 2

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(mockOpenmrsFetch).not.toHaveBeenCalledWith(expect.stringContaining('/patient?'), expect.anything());
    expect(result.current.data).toBeNull();
  });
});
