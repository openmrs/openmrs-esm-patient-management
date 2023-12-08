import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompactPatientSearchComponent from './compact-patient-search.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useSession: jest.fn(() => ({
    ...jest.requireActual('@openmrs/esm-framework').useSession(),
    sessionLocation: {
      uuid: 'location-uuid',
    },
  })),
  useConfig: jest.fn(() => ({
    ...jest.requireActual('@openmrs/esm-framework').useConfig(),
    search: {
      patientResultUrl: '/patient/{{patientUuid}}/chart',
    },
  })),
}));

describe('CompactPatientSearchComponent', () => {
  it('renders without crashing', () => {
    render(<CompactPatientSearchComponent isSearchPage={true} initialSearchTerm="" />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('updates search term on input change', async () => {
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent isSearchPage={true} initialSearchTerm="" />);
    const searchInput: HTMLInputElement = screen.getByRole('searchbox');

    await user.type(searchInput, 'John');

    expect(searchInput.value).toBe('John');
  });

  it('clears search term on clear button click', async () => {
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent isSearchPage={true} initialSearchTerm="" />);
    const searchInput: HTMLInputElement = screen.getByRole('searchbox');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    await user.type(searchInput, 'John');
    await user.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('renders search results when search term is not empty', async () => {
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);
    const searchInput = screen.getByRole('searchbox');

    await user.type(searchInput, 'John');

    const searchResultsContainer = screen.getByTestId('floatingSearchResultsContainer');
    expect(searchResultsContainer).toBeInTheDocument();
  });

  it('renders a list of recently searched patients when a search term is not provided', async () => {
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);
    const searchInput = screen.getByRole('searchbox');

    await user.clear(searchInput);

    const searchResultsContainer = screen.getByTestId('floatingSearchResultsContainer');
    expect(searchResultsContainer).toBeInTheDocument();
  });
});
