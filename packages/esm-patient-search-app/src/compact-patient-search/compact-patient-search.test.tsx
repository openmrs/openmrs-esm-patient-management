import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
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
    render(<CompactPatientSearchComponent isSearchPage={true} initialSearchTerm="" />);
    const searchInput: HTMLInputElement = screen.getByRole('searchbox');

    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      expect(searchInput.value).toBe('John');
    });
  });

  it('clears search term on clear button click', async () => {
    render(<CompactPatientSearchComponent isSearchPage={true} initialSearchTerm="" />);
    const searchInput: HTMLInputElement = screen.getByRole('searchbox');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    fireEvent.change(searchInput, { target: { value: 'John' } });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(searchInput.value).toBe('');
    });
  });

  it('renders search results when search term is not empty', async () => {
    render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);
    const searchInput = screen.getByRole('searchbox');

    fireEvent.change(searchInput, { target: { value: 'John' } });

    await waitFor(() => {
      const searchResultsContainer = screen.getByTestId('floatingSearchResultsContainer');
      expect(searchResultsContainer).toBeInTheDocument();
    });
  });

  it('renders recent patient search when search term is empty', async () => {
    render(<CompactPatientSearchComponent isSearchPage={false} initialSearchTerm="" />);
    const searchInput = screen.getByRole('searchbox');

    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      const searchResultsContainer = screen.getByTestId('floatingSearchResultsContainer');
      expect(searchResultsContainer).toBeInTheDocument();
    });
  });

  // Example test for patient selection
  it.skip('calls selectPatientAction on patient selection', async () => {
    const selectPatientActionMock = jest.fn();
    render(
      <CompactPatientSearchComponent
        selectPatientAction={selectPatientActionMock}
        initialSearchTerm=""
        isSearchPage={true}
      />,
    );

    const searchInput = screen.getByRole('searchbox');

    fireEvent.change(searchInput, { target: { value: 'John' } });

    // const patientBanner = screen.getByTestId('patient-banner'); // Assuming a test ID on patient banner element
    // fireEvent.click(patientBanner);

    // expect(selectPatientActionMock).toHaveBeenCalled();
  });
});
