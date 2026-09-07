/**
 * @vitest-environment jsdom
 *
 * The refine-search form submit does not fire its callback under happy-dom (see
 * advanced-patient-search.test.tsx). Run this file under jsdom.
 */
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { type FetchResponse, getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { type SearchedPatient } from '../types';
import { configSchema } from '../config-schema';
import { usePersonAttributeType } from './refine-search/person-attributes.resource';
import AdvancedPatientSearchComponent from './advanced-patient-search.component';

vi.mock('./refine-search/person-attributes.resource', () => ({ usePersonAttributeType: vi.fn() }));

// The framework mock hides the banner's contents, so render each result as its name. The other views are real.
vi.mock('./patient-search-views.component', async () => ({
  ...((await vi.importActual('./patient-search-views.component')) as object),
  PatientSearchResults: ({ searchResults }: { searchResults: Array<SearchedPatient> }) => (
    <>
      {searchResults.map((patient) => (
        <div key={patient.uuid}>{patient.person.personName.display}</div>
      ))}
    </>
  ),
}));

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
);

// Retries would mask which pages the wave loop asked for on its own.
const noRetryWrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false, errorRetryCount: 0 }}>
    {children}
  </SWRConfig>
);

// A big clinic's result set: far more pages than one wave, and not a whole number of pages.
const TOTAL = 1700;
const PAGE_SIZE = 50;
const TOTAL_PAGES = Math.ceil(TOTAL / PAGE_SIZE);

// Every patient gets a unique postcode, so the refine filter can single out any one of them.
const postcodeOf = (index: number) => `${10000 + index}`;

const makePatient = (index: number) => ({
  uuid: `p-${index}`,
  person: {
    personName: { display: `Patient ${index}` },
    addresses: [{ postalCode: postcodeOf(index) }],
  },
});

describe('advanced search paging for a large result set', () => {
  let requestedUrls: Array<string>;
  let inFlight: number;
  let maxInFlight: number;

  /** Serves the result set a page at a time, resolving after a tick so overlap is observable. */
  const respondWith = (failAtStartIndex?: number) =>
    mockOpenmrsFetch.mockImplementation(async (url: string) => {
      requestedUrls.push(url);
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight--;

      const startIndex = Number(new URL(url, 'http://localhost').searchParams.get('startIndex') ?? 0);
      if (startIndex === failAtStartIndex) {
        throw new Error('page request failed');
      }

      const count = Math.max(0, Math.min(PAGE_SIZE, TOTAL - startIndex));
      return {
        data: {
          results: Array.from({ length: count }, (_, i) => makePatient(startIndex + i)),
          links: TOTAL > startIndex + PAGE_SIZE ? [{ rel: 'next' }] : [],
          totalCount: TOTAL,
        },
      } as unknown as FetchResponse;
    });

  beforeEach(() => {
    vi.useRealTimers();
    requestedUrls = [];
    inFlight = 0;
    maxInFlight = 0;
    vi.mocked(usePersonAttributeType).mockReturnValue({ data: null, isLoading: false, error: null } as never);
    vi.mocked(useConfig).mockReturnValue(getDefaultsFromConfigSchema(configSchema));

    mockOpenmrsFetch.mockReset();
    respondWith();
  });

  it('loads every page of a 1700-result query so a patient on the last page can be found', async () => {
    const user = userEvent.setup();
    render(<AdvancedPatientSearchComponent query="jos" />, { wrapper });

    // The header counts every loaded row, not just the rendered page.
    await screen.findByRole('heading', { name: /1700 search result/i }, { timeout: 10000 });

    // Nothing truncated, and no page fetched twice.
    expect(requestedUrls).toHaveLength(TOTAL_PAGES);
    expect(new Set(requestedUrls).size).toBe(requestedUrls.length);

    // The refine filter runs over the loaded rows, so this only finds the patient if the last page landed.
    await user.type(screen.getByRole('textbox', { name: /postcode/i }), postcodeOf(TOTAL - 1));
    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(screen.getByRole('heading', { name: '1 search result' })).toBeInTheDocument();
    expect(screen.getByText(`Patient ${TOTAL - 1}`)).toBeInTheDocument();
  });

  it('spreads the pages over bounded waves rather than one burst of requests', async () => {
    render(<AdvancedPatientSearchComponent query="jos" />, { wrapper });

    await screen.findByRole('heading', { name: /1700 search result/i }, { timeout: 10000 });

    expect(maxInFlight).toBeGreaterThan(1);
    expect(maxInFlight).toBeLessThan(TOTAL_PAGES - 1);
  });

  it('stops opening waves once a page request fails', async () => {
    // Page 1 lands, so the loop knows there are 34 pages; a page in the first wave then fails.
    respondWith(PAGE_SIZE);

    render(<AdvancedPatientSearchComponent query="jos" />, { wrapper: noRetryWrapper });

    await screen.findByText(/sorry, there was an error/i, undefined, { timeout: 10000 });
    const requestedByTheError = requestedUrls.length;

    // Give any further wave time to be opened, so this fails loudly if the loop keeps going.
    await new Promise((r) => setTimeout(r, 200));

    expect(requestedUrls).toHaveLength(requestedByTheError);
    expect(requestedUrls.length).toBeLessThan(TOTAL_PAGES);
  });
});
