import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, navigate, useConfig, useSession } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import CompactPatientSearchComponent from './compact-patient-search.component';

const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);
const mockUseSession = jest.mocked(useSession);
const mockNavigate = jest.mocked(navigate);

describe('CompactPatientSearchComponent', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
    mockUseSession.mockReturnValue(mockSession.data);
  });

  it('renders a compact search bar', () => {
    render(<CompactPatientSearchComponent isSearchPage initialSearchTerm="" />);
    expect(screen.getByPlaceholderText(/Search for a patient by name or identifier number/i)).toBeInTheDocument();
  });

  it('renders search results when search term is not empty', async () => {
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);
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
        patientResultUrl: configSchema.search.patientResultUrl._default,
      },
    });
    render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);
    const searchResultsContainer = screen.getByTestId('floatingSearchResultsContainer');
    expect(searchResultsContainer).toBeInTheDocument();
  });

  it('navigates to the advanced search page with the correct query string when the Search button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" shouldNavigateToPatientSearchPage />,
    );
    const searchbox = screen.getByRole('searchbox');
    await user.type(searchbox, 'John');
    const searchButton = screen.getByRole('button', { name: /search/i });
    await user.click(searchButton);
    expect(mockNavigate).toHaveBeenCalledWith({ to: expect.stringMatching(/.*\/search\?query=John/) });
  });
});
