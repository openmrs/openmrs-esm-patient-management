import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { configSchema } from '../config-schema';
import { usePersonAttributeType } from './refine-search/person-attributes.resource';
import AdvancedPatientSearchComponent from './advanced-patient-search.component';

vi.mock('./refine-search/person-attributes.resource', () => ({ usePersonAttributeType: vi.fn() }));
vi.mock('./patient-search-views.component', () => ({
  EmptyState: () => <div data-testid="results" data-count="0" />,
  ErrorState: () => <div />,
  LoadingState: () => <div />,
  PatientSearchResults: ({ searchResults }: { searchResults: Array<unknown> }) => (
    <div data-testid="results" data-count={searchResults.length} />
  ),
}));

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
);

// A big clinic's result set: far more pages than one wave, and not a whole number of pages.
const TOTAL = 1700;
const PAGE_SIZE = 50;

describe('advanced search paging for a large result set', () => {
  let requestedUrls: Array<string>;
  let inFlight: number;
  let maxInFlight: number;

  beforeEach(() => {
    vi.useRealTimers();
    requestedUrls = [];
    inFlight = 0;
    maxInFlight = 0;
    vi.mocked(usePersonAttributeType).mockReturnValue({ data: null, isLoading: false, error: null } as never);
    vi.mocked(useConfig).mockReturnValue(getDefaultsFromConfigSchema(configSchema));

    mockOpenmrsFetch.mockReset();
    mockOpenmrsFetch.mockImplementation(async (url: string) => {
      requestedUrls.push(url);
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;

      const startIndex = Number(new URL(url, 'http://localhost').searchParams.get('startIndex') ?? 0);
      const count = Math.max(0, Math.min(PAGE_SIZE, TOTAL - startIndex));

      return {
        data: {
          results: Array.from({ length: count }, (_, i) => ({ uuid: `p-${startIndex + i}`, person: {} })),
          links: TOTAL > startIndex + PAGE_SIZE ? [{ rel: 'next' }] : [],
          totalCount: TOTAL,
        },
      } as unknown as FetchResponse;
    });
  });

  it('loads every page of a 1700-result query without leaving patients unreachable', async () => {
    render(<AdvancedPatientSearchComponent query="jos" />, { wrapper });

    // The header counts every row held on the client, so it is the loaded total — the rendered list
    // only ever holds one page of it.
    await screen.findByRole('heading', { name: /1700 search result/i }, { timeout: 10000 });

    // Nothing truncated, and no page fetched twice.
    expect(requestedUrls).toHaveLength(Math.ceil(TOTAL / PAGE_SIZE));
    expect(new Set(requestedUrls).size).toBe(requestedUrls.length);
  });

  it('spreads the pages over bounded waves rather than one burst of requests', async () => {
    render(<AdvancedPatientSearchComponent query="jos" />, { wrapper });

    await screen.findByRole('heading', { name: /1700 search result/i }, { timeout: 10000 });

    expect(maxInFlight).toBeLessThanOrEqual(8);
    expect(maxInFlight).toBeGreaterThan(1);
  });
});
