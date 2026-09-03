import React from 'react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useInfinitePatientSearch, useRestPatients } from './patient-search.resource';

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
});

// `revalidateFirstPage: false` stops SWR from ever re-fetching a page it already holds, and SWR has
// no cache expiry, so without the targeted revalidation below a query's results would be pinned for
// the life of the SPA session.
describe('useInfinitePatientSearch page 1 revalidation', () => {
  let cache: Map<string, unknown>;
  let requestedUrls: Array<string>;

  const sharedCacheWrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => cache as never, dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  /** Serves `total` patients in pages of 10, so page boundaries and `hasMore` behave realistically. */
  const respondWith = (total: number) =>
    mockOpenmrsFetch.mockImplementation((url: string) => {
      requestedUrls.push(url);
      const params = new URL(url, 'http://localhost').searchParams;
      const startIndex = Number(params.get('startIndex') ?? 0);
      const count = Math.max(0, Math.min(10, total - startIndex));

      return Promise.resolve({
        data: {
          results: Array.from({ length: count }, (_, i) => ({
            uuid: `${params.get('q')}-${startIndex + i}`,
            person: { personName: { display: params.get('q') } },
          })),
          links: total > startIndex + 10 ? [{ rel: 'next' }] : [],
          totalCount: total,
        },
      } as unknown as FetchResponse);
    });

  const settle = () =>
    act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

  const isFirstPage = (url: string) => !url.includes('startIndex');

  beforeEach(() => {
    vi.useRealTimers();
    cache = new Map();
    requestedUrls = [];
    mockOpenmrsFetch.mockReset();
    respondWith(100);
  });

  it('issues exactly one request for a query that is not cached yet', async () => {
    const { result } = renderHook(() => useInfinitePatientSearch('Mary', false), { wrapper: sharedCacheWrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(10));
    await settle();

    expect(requestedUrls).toHaveLength(1);
    expect(isFirstPage(requestedUrls[0])).toBe(true);
  });

  // The workflow this exists for: a clerk searches for a patient who does not exist yet, registers
  // them, then searches the same term again to check them in. Registration navigates within the SPA
  // and never invalidates the search key, so without this the cached "no results" would be shown.
  it('picks up a patient registered after an empty result was cached', async () => {
    respondWith(0);

    const { result: cachedResult, unmount } = renderHook(() => useInfinitePatientSearch('Mary', false), {
      wrapper: sharedCacheWrapper,
    });
    await waitFor(() => expect(cachedResult.current.data).toEqual([]));
    unmount();

    respondWith(1);
    requestedUrls = [];

    const { result } = renderHook(() => useInfinitePatientSearch('Mary', false), { wrapper: sharedCacheWrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(requestedUrls).toHaveLength(1);
    expect(isFirstPage(requestedUrls[0])).toBe(true);
  });

  // Refreshing page 1 must not become a refresh of everything: re-fetching the loaded pages would
  // cost a round trip each and replace the rendered rows' objects, which is what
  // `revalidateFirstPage: false` was introduced to avoid.
  it('refreshes only page 1, leaving already-loaded pages untouched', async () => {
    const { result: cachedResult, unmount } = renderHook(() => useInfinitePatientSearch('Mary', false), {
      wrapper: sharedCacheWrapper,
    });
    await waitFor(() => expect(cachedResult.current.data).toHaveLength(10));
    await act(async () => {
      await cachedResult.current.setPage(3);
    });
    await waitFor(() => expect(cachedResult.current.data).toHaveLength(30));
    unmount();

    requestedUrls = [];
    const { result } = renderHook(() => useInfinitePatientSearch('Mary', false), { wrapper: sharedCacheWrapper });
    await settle();

    expect(requestedUrls).toHaveLength(1);
    expect(isFirstPage(requestedUrls[0])).toBe(true);
    expect(result.current.data).toHaveLength(30);
  });

  it('does not re-fetch page 1 when appending a page', async () => {
    const { result } = renderHook(() => useInfinitePatientSearch('Mary', false), { wrapper: sharedCacheWrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(10));

    requestedUrls = [];
    await act(async () => {
      await result.current.setPage(2);
    });
    await settle();

    expect(requestedUrls).toEqual([expect.stringContaining('startIndex=10')]);
  });

  it('revalidates again when the search is cleared and the same term is entered again', async () => {
    const { result, rerender } = renderHook(
      ({ q, searching }: { q: string; searching: boolean }) => useInfinitePatientSearch(q, false, searching),
      { wrapper: sharedCacheWrapper, initialProps: { q: 'Mary', searching: true } },
    );
    await waitFor(() => expect(result.current.data).toHaveLength(10));

    rerender({ q: '', searching: false });
    await settle();

    requestedUrls = [];
    rerender({ q: 'Mary', searching: true });
    await settle();

    expect(requestedUrls).toHaveLength(1);
    expect(isFirstPage(requestedUrls[0])).toBe(true);
  });

  it('keeps the cached results on screen while page 1 is being refreshed', async () => {
    const { result: cachedResult, unmount } = renderHook(() => useInfinitePatientSearch('Mary', false), {
      wrapper: sharedCacheWrapper,
    });
    await waitFor(() => expect(cachedResult.current.data).toHaveLength(10));
    unmount();

    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}) as never);

    const { result } = renderHook(() => useInfinitePatientSearch('Mary', false), { wrapper: sharedCacheWrapper });
    await settle();

    expect(result.current.data).toHaveLength(10);
    expect(result.current.isLoading).toBe(false);
  });
});

describe('useRestPatients', () => {
  let cache: Map<string, unknown>;
  let requestedUrls: Array<string>;

  const uuids = Array.from({ length: 10 }, (_, i) => `uuid-${i}`);

  const sharedCacheWrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => cache as never, dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  /** Serves one patient per URL, tagging the name so a stale read is distinguishable from a fresh one. */
  const respondWith = ({ nameSuffix = '', voided = false }: { nameSuffix?: string; voided?: boolean } = {}) =>
    mockOpenmrsFetch.mockImplementation((url: string) => {
      requestedUrls.push(url);
      const uuid = url.split('/patient/')[1].split('?')[0];

      return Promise.resolve({
        data: { uuid, voided, person: { personName: { display: `${uuid}${nameSuffix}` } } },
      } as unknown as FetchResponse);
    });

  const settle = () =>
    act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

  beforeEach(() => {
    vi.useRealTimers();
    cache = new Map();
    requestedUrls = [];
    mockOpenmrsFetch.mockReset();
    respondWith();
  });

  // `initialSize` covers the whole list and the list is capped at 10, so the infinite pagination
  // never engages. This is what makes refreshing page 1 alone the wrong unit for this hook.
  it('fetches the whole list up front, leaving no further pages to append', async () => {
    const { result } = renderHook(() => useRestPatients(uuids), { wrapper: sharedCacheWrapper });

    await waitFor(() => expect(result.current.data).toHaveLength(10));

    expect(requestedUrls).toHaveLength(10);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.currentPage).toBe(10);
  });

  it('refreshes every patient when the list is mounted again', async () => {
    const { result: cachedResult, unmount } = renderHook(() => useRestPatients(uuids), {
      wrapper: sharedCacheWrapper,
    });
    await waitFor(() => expect(cachedResult.current.data).toHaveLength(10));
    unmount();

    respondWith({ nameSuffix: '-renamed' });
    requestedUrls = [];

    const { result } = renderHook(() => useRestPatients(uuids), { wrapper: sharedCacheWrapper });

    await waitFor(() => expect(result.current.data?.[0].person.personName.display).toBe('uuid-0-renamed'));
    expect(requestedUrls).toHaveLength(10);
  });

  // The list is filtered on `voided`, so pinning it for the session would keep showing a patient
  // who has since been voided.
  it('drops a patient voided since the list was cached', async () => {
    const { result: cachedResult, unmount } = renderHook(() => useRestPatients(uuids), {
      wrapper: sharedCacheWrapper,
    });
    await waitFor(() => expect(cachedResult.current.data).toHaveLength(10));
    unmount();

    respondWith({ voided: true });

    const { result } = renderHook(() => useRestPatients(uuids), { wrapper: sharedCacheWrapper });

    await waitFor(() => expect(result.current.data).toEqual([]));
  });

  // Refreshing on mount is scoped to opening the search; refetching all ten patients every time the
  // window regains focus would be needless traffic for data that rarely changes.
  it('does not refresh on window focus', async () => {
    const { result } = renderHook(() => useRestPatients(uuids), { wrapper: sharedCacheWrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(10));

    requestedUrls = [];
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await settle();

    expect(requestedUrls).toHaveLength(0);
  });

  it('keeps the cached list on screen while it is being refreshed', async () => {
    const { result: cachedResult, unmount } = renderHook(() => useRestPatients(uuids), {
      wrapper: sharedCacheWrapper,
    });
    await waitFor(() => expect(cachedResult.current.data).toHaveLength(10));
    unmount();

    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}) as never);

    const { result } = renderHook(() => useRestPatients(uuids), { wrapper: sharedCacheWrapper });
    await settle();

    expect(result.current.data).toHaveLength(10);
    expect(result.current.isLoading).toBe(false);
  });
});

// The advanced search needs the whole result set on the client for its filters and result count.
// Walking it a page at a time cost a serialised round trip per page, so pages are fetched in
// parallel instead. `parallel: true` stops SWR passing the previous page to `getKey`, so the end of
// the result set is recognised from the total page 1 reports rather than from its `next` link.
describe('useInfinitePatientSearch parallel paging', () => {
  let cache: Map<string, unknown>;
  let requestedUrls: Array<string>;
  let inFlight: number;
  let maxInFlight: number;

  const sharedCacheWrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig value={{ provider: () => cache as never, dedupingInterval: 0 }}>{children}</SWRConfig>
  );

  /** Serves `total` patients in pages of 10, resolving after a tick so overlap is observable. */
  const respondWith = (total: number) =>
    mockOpenmrsFetch.mockImplementation(async (url: string) => {
      requestedUrls.push(url);
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;

      const params = new URL(url, 'http://localhost').searchParams;
      const startIndex = Number(params.get('startIndex') ?? 0);
      const count = Math.max(0, Math.min(10, total - startIndex));

      return {
        data: {
          results: Array.from({ length: count }, (_, i) => ({ uuid: `p-${startIndex + i}`, person: {} })),
          links: total > startIndex + 10 ? [{ rel: 'next' }] : [],
          totalCount: total,
        },
      } as unknown as FetchResponse;
    });

  const settle = () =>
    act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

  beforeEach(() => {
    vi.useRealTimers();
    cache = new Map();
    requestedUrls = [];
    inFlight = 0;
    maxInFlight = 0;
    mockOpenmrsFetch.mockReset();
    respondWith(100);
  });

  it('fetches the requested pages concurrently rather than one round trip at a time', async () => {
    const { result } = renderHook(() => useInfinitePatientSearch('Mary', false), { wrapper: sharedCacheWrapper });
    await waitFor(() => expect(result.current.totalResults).toBe(100));

    requestedUrls = [];
    maxInFlight = 0;
    await act(async () => {
      await result.current.setPage(10);
    });
    await settle();

    expect(result.current.data).toHaveLength(100);
    expect(requestedUrls).toHaveLength(9); // pages 2..10; page 1 is already cached
    expect(maxInFlight).toBe(9);
  });

  it('does not request pages past the end of the result set', async () => {
    respondWith(25);
    const { result } = renderHook(() => useInfinitePatientSearch('Mary', false), { wrapper: sharedCacheWrapper });
    await waitFor(() => expect(result.current.totalResults).toBe(25));

    // Far more pages than exist: the guard, not the caller, has to stop the fetching.
    await act(async () => {
      await result.current.setPage(20);
    });
    await settle();

    expect(requestedUrls).toHaveLength(3);
    expect(result.current.data).toHaveLength(25);
    expect(result.current.hasMore).toBe(false);
  });

  // `keepPreviousData` leaves the outgoing query's pages in `data`, so reading the total off
  // `data[0]` reported the previous query's count. Callers size their page requests from it, which
  // would make a narrow query fetch pages the new result set does not have.
  it('reports no total for a query whose first page has not arrived yet', async () => {
    const { result, rerender } = renderHook(({ q }: { q: string }) => useInfinitePatientSearch(q, false), {
      wrapper: sharedCacheWrapper,
      initialProps: { q: 'Mary' },
    });
    await waitFor(() => expect(result.current.totalResultsForQuery).toBe(100));

    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}) as never);
    rerender({ q: 'Zebediah' });
    await settle();

    expect(result.current.data).toHaveLength(10); // the previous query's page 1, still on screen
    expect(result.current.totalResultsForQuery).toBe(0);
  });

  // The counterpart to the above: the rows held by `keepPreviousData` are still on screen, and
  // `totalResults` is what a view prints above them. Reporting the incoming query's total here —
  // zero until its first page lands — renders those patients under "0 search results".
  it('keeps reporting the loaded result count while a new query is being fetched', async () => {
    const { result, rerender } = renderHook(({ q }: { q: string }) => useInfinitePatientSearch(q, false), {
      wrapper: sharedCacheWrapper,
      initialProps: { q: 'Mary' },
    });
    await waitFor(() => expect(result.current.totalResults).toBe(100));

    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}) as never);
    rerender({ q: 'Zebediah' });
    await settle();

    expect(result.current.data).toHaveLength(10);
    expect(result.current.totalResults).toBe(100);
  });
});
