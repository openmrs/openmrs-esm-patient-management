import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import {
  defineConfigSchema,
  getDefaultsFromConfigSchema,
  navigate,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import CompactPatientSearchComponent from './compact-patient-search.component';
import { configSchema } from '../config-schema';

defineConfigSchema('@openmrs/esm-patient-search-app', configSchema);

const mockedUseConfig = useConfig as jest.Mock;
const mockedUseSession = useSession as jest.Mock;
const mockedNavigate = navigate as jest.Mock;

describe('CompactPatientSearchComponent', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
    mockedUseSession.mockReturnValue({
      sessionLocation: {
        uuid: 'location-uuid',
      },
    });
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
    mockedUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: { showRecentlySearchedPatients: true },
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
    expect(mockedNavigate).toHaveBeenCalledWith({ to: expect.stringMatching(/.*\/search\?query=John/) });
  });
});
