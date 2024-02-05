import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import CompactPatientSearchComponent from './compact-patient-search.component';

const mockedUseConfig = jest.mocked(useConfig);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useSession: jest.fn().mockReturnValue({
    sessionLocation: {
      uuid: 'location-uuid',
    },
  }),
  useConfig: jest.fn().mockReturnValue({
    search: {
      patientResultUrl: '/patient/{{patientUuid}}/chart',
      showRecentlySearchedPatients: false,
    },
  }),
}));

describe('CompactPatientSearchComponent', () => {
  beforeEach(() => mockedUseConfig.mockClear());

  it('renders a compact search bar', () => {
    render(<CompactPatientSearchComponent isSearchPage initialSearchTerm="" />);

    expect(screen.getByPlaceholderText(/Search for a patient by name or identifier number/i)).toBeInTheDocument();
  });

  it('typing into the searchbox updates the search term and triggers a search', async () => {
    const user = userEvent.setup();

    render(<CompactPatientSearchComponent isSearchPage initialSearchTerm="" />);

    const searchbox = screen.getByPlaceholderText(/Search for a patient by name or identifier number/i);

    await user.type(searchbox, 'John');

    expect(screen.getByDisplayValue(/John/i)).toBeInTheDocument();
  });

  it('clears search term on clear button click', async () => {
    const user = userEvent.setup();

    render(<CompactPatientSearchComponent isSearchPage={true} initialSearchTerm="" />);

    const searchbox = screen.getByPlaceholderText(/Search for a patient by name or identifier number/i);

    const clearButton = screen.getByRole('button', { name: /Clear/i });

    await user.type(searchbox, 'John');
    await user.click(clearButton);

    expect(screen.queryByDisplayValue(/John/i)).not.toBeInTheDocument();
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
    const user = userEvent.setup();

    mockedUseConfig.mockReturnValue({
      search: {
        showRecentlySearchedPatients: true,
      },
    });

    render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);

    const searchbox = screen.getByRole('searchbox');

    await user.clear(searchbox);

    const searchResultsContainer = screen.getByTestId('floatingSearchResultsContainer');

    expect(searchResultsContainer).toBeInTheDocument();
  });
});
