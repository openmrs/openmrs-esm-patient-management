/**
 * @vitest-environment jsdom
 *
 * The form-submit flow under test does not fire its callback under happy-dom
 * (likely a DOM-event-dispatch divergence). Run this file under jsdom.
 */
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getDefaultsFromConfigSchema, navigate, useConfig, useSession } from '@openmrs/esm-framework';
import { renderWithRouter } from 'tools';
import { mockSession } from '__mocks__';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import { type SearchedPatient } from '../types';
import { useInfinitePatientSearch, useRecentlyViewedPatients, useRestPatients } from '../patient-search.resource';
import CompactPatientSearchComponent from './compact-patient-search.component';

// Keep keyboard handling and result components real; mock transport and virtualizer measurements.
vi.mock('../patient-search.resource');
vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: ({ count }: { count: number }) => ({
    getVirtualItems: () =>
      Array.from({ length: count }, (_, index) => ({ index, key: index, start: index * 90, size: 90 })),
    getTotalSize: () => count * 90,
    scrollToIndex: () => {},
    measureElement: () => {},
    isScrolling: false,
  }),
}));

const mockUseConfig = vi.mocked(useConfig<PatientSearchConfig>);
const mockUseSession = vi.mocked(useSession);
const mockNavigate = vi.mocked(navigate);
const mockUseInfinitePatientSearch = vi.mocked(useInfinitePatientSearch);
const mockUseRestPatients = vi.mocked(useRestPatients);
const mockUseRecentlyViewedPatients = vi.mocked(useRecentlyViewedPatients);

const patient: SearchedPatient = {
  uuid: 'searched-patient',
  attributes: [],
  identifiers: [],
  person: {
    age: 30,
    addresses: [],
    birthdate: '1996-01-01',
    dead: false,
    deathDate: null,
    gender: 'M',
    personName: { display: 'John Smith', givenName: 'John', middleName: '', familyName: 'Smith' },
  },
};

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
  });

  it('requires a new arrow selection after clearing the search', async () => {
    const user = userEvent.setup();
    mockUseInfinitePatientSearch.mockReturnValue(buildSearchResponse([patient]));
    mockUseRestPatients.mockReturnValue(buildSearchResponse([{ ...patient, uuid: 'recent-patient' }]));
    renderWithRouter(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="John" />);
    const input = screen.getByRole('searchbox');
    await user.click(input);
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement?.getAttribute('href')).toContain('searched-patient');
    await user.click(screen.getByRole('button', { name: 'Clear', exact: true }));
    expect(input).toHaveValue('');
    expect(input).toHaveFocus();
    expect(screen.getByRole('link')).toHaveAttribute('href', expect.stringContaining('recent-patient'));
    await user.keyboard('{Enter}');
    expect(mockNavigate).not.toHaveBeenCalled();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement?.getAttribute('href')).toContain('recent-patient');
    await user.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith({ to: expect.stringContaining('/patient/recent-patient/chart/') });
  });

  it('resets selection when the patient at the same index changes', async () => {
    const user = userEvent.setup();
    mockUseInfinitePatientSearch.mockReturnValue(buildSearchResponse([patient]));
    const { rerender } = render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="John" />, {
      wrapper: MemoryRouter,
    });
    await user.click(screen.getByRole('searchbox'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement?.getAttribute('href')).toContain('searched-patient');

    mockUseInfinitePatientSearch.mockReturnValue(buildSearchResponse([{ ...patient, uuid: 'replacement-patient' }]));
    rerender(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="John" />);

    expect(screen.getByRole('searchbox')).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it.each([false, true])('preserves selection when results refresh (append: %s)', async (append) => {
    const user = userEvent.setup();
    mockUseInfinitePatientSearch.mockReturnValue(buildSearchResponse([patient]));
    const { rerender } = render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="John" />, {
      wrapper: MemoryRouter,
    });
    await user.click(screen.getByRole('searchbox'));
    await user.keyboard('{ArrowDown}');

    mockUseInfinitePatientSearch.mockReturnValue(
      buildSearchResponse(append ? [{ ...patient }, { ...patient, uuid: 'appended-patient' }] : [{ ...patient }]),
    );
    rerender(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="John" />);

    expect(document.activeElement?.getAttribute('href')).toContain('searched-patient');
    await user.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith({ to: expect.stringContaining('/patient/searched-patient/chart/') });
  });
});
