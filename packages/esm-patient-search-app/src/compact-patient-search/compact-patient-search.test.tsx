/**
 * @vitest-environment jsdom
 *
 * The form-submit flow under test does not fire its callback under happy-dom
 * (likely a DOM-event-dispatch divergence). Run this file under jsdom.
 */
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, navigate, useConfig, useSession } from '@openmrs/esm-framework';
import { renderWithRouter } from 'tools';
import { mockSession } from '__mocks__';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import { type SearchedPatient } from '../types';
import { useInfinitePatientSearch, useRecentlyViewedPatients, useRestPatients } from '../patient-search.resource';
import useArrowNavigation from '../hooks/useArrowNavigation';
import CompactPatientSearchComponent from './compact-patient-search.component';

// The data hooks are mocked so each test can dictate the exact result counts without standing up
// SWR/network behaviour, and the result-list children are stubbed so these tests stay focused on
// what the page hands to arrow-key navigation rather than how the lists render.
vi.mock('../patient-search.resource');
vi.mock('../hooks/useArrowNavigation', () => ({ default: vi.fn(() => -1) }));
vi.mock('./patient-search.component', async () => ({
  default: (await import('react')).forwardRef(() => null),
}));
vi.mock('./recently-searched-patients.component', async () => ({
  default: (await import('react')).forwardRef(() => null),
}));

const mockUseConfig = vi.mocked(useConfig<PatientSearchConfig>);
const mockUseSession = vi.mocked(useSession);
const mockNavigate = vi.mocked(navigate);
const mockUseInfinitePatientSearch = vi.mocked(useInfinitePatientSearch);
const mockUseRestPatients = vi.mocked(useRestPatients);
const mockUseRecentlyViewedPatients = vi.mocked(useRecentlyViewedPatients);
const mockUseArrowNavigation = vi.mocked(useArrowNavigation);

const buildPatients = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ uuid: `patient-${index}` })) as unknown as Array<SearchedPatient>;

const buildSearchResponse = (data: Array<SearchedPatient>) => ({
  data,
  isLoading: false,
  fetchError: null,
  hasMore: false,
  isValidating: false,
  setPage: vi.fn(),
  currentPage: 1,
  totalResults: data.length,
});

describe('CompactPatientSearchComponent', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
    mockUseSession.mockReturnValue(mockSession.data);
    mockUseInfinitePatientSearch.mockReturnValue(buildSearchResponse([]));
    mockUseRestPatients.mockReturnValue(buildSearchResponse([]));
    mockUseRecentlyViewedPatients.mockReturnValue({
      error: null,
      isLoadingPatients: false,
      recentlyViewedPatientUuids: [],
      updateRecentlyViewedPatients: vi.fn(),
      mutateUserProperties: vi.fn(),
    });
    mockUseArrowNavigation.mockReturnValue(-1);
  });

  it('renders a compact search bar', () => {
    renderWithRouter(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);

    expect(screen.getByPlaceholderText(/Search for a patient by name or identifier number/i)).toBeInTheDocument();
  });

  it('renders search results when search term is not empty', async () => {
    const user = userEvent.setup();

    renderWithRouter(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);

    const searchbox = screen.getByPlaceholderText(/Search for a patient by name or identifier number/i);

    await user.type(searchbox, 'John');

    const searchResultsContainer = screen.getByTestId('floatingSearchResultsContainer');
    expect(searchResultsContainer).toBeInTheDocument();
  });

  it('renders a list of recently searched patients when a search term is not provided and the showRecentlySearchedPatients config property is set', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        showRecentlySearchedPatients: true,
        disableTabletSearchOnKeyUp: true,
      } as PatientSearchConfig['search'],
    });

    renderWithRouter(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);

    const searchResultsContainer = screen.getByTestId('floatingSearchResultsContainer');
    expect(searchResultsContainer).toBeInTheDocument();
  });

  it('does not render recently searched patients when the feature is disabled', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        showRecentlySearchedPatients: false,
        disableTabletSearchOnKeyUp: true,
      } as PatientSearchConfig['search'],
    });

    renderWithRouter(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);

    expect(screen.queryByTestId('floatingSearchResultsContainer')).not.toBeInTheDocument();
  });

  it('navigates to the advanced search page with the correct query string when the Search button is clicked', async () => {
    const user = userEvent.setup();

    renderWithRouter(
      <CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" shouldNavigateToPatientSearchPage />,
    );

    const searchbox = screen.getByRole('searchbox');

    await user.type(searchbox, 'John');

    const searchButton = screen.getByRole('button', { name: /search/i });

    await user.click(searchButton);

    expect(mockNavigate).toHaveBeenCalledWith({ to: expect.stringMatching(/.*\/search\?query=John/) });
  });

  // Arrow-key navigation must walk the list that is actually on screen, so the count it receives has
  // to track the displayed results. Recently-viewed patients linger in their hook (keepPreviousData)
  // after a search starts; if navigation were sized off that stale list it would clamp partway down
  // the search results.
  it('sizes arrow-key navigation to the search results while a search is active, even when recently-viewed patients are still cached', () => {
    mockUseInfinitePatientSearch.mockReturnValue(buildSearchResponse(buildPatients(10)));
    mockUseRestPatients.mockReturnValue(buildSearchResponse(buildPatients(7)));

    renderWithRouter(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="John" />);

    expect(mockUseArrowNavigation.mock.calls.at(-1)?.[0]).toBe(10);
  });

  it('sizes arrow-key navigation to the recently-viewed patients when no search is active', () => {
    mockUseInfinitePatientSearch.mockReturnValue(buildSearchResponse([]));
    mockUseRestPatients.mockReturnValue(buildSearchResponse(buildPatients(7)));

    renderWithRouter(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);

    expect(mockUseArrowNavigation.mock.calls.at(-1)?.[0]).toBe(7);
  });
});
