import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, isDesktop, useConfig } from '@openmrs/esm-framework';
import { type PatientSearchConfig, configSchema } from '../config-schema';
import PatientSearchLaunch from './patient-search-icon.component';

const mockIsDesktop = jest.mocked(isDesktop);
const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: jest.fn(() => [
    {
      get: jest.fn(() => 'John'),
    },
  ]),
}));

describe('PatientSearchLaunch', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        disableTabletSearchOnKeyUp: false,
        patientResultUrl: configSchema.search.patientResultUrl._default,
        showRecentlySearchedPatients: false,
      },
    });
  });

  it('renders without errors', () => {
    render(<PatientSearchLaunch />);
    expect(screen.getByRole('button', { name: 'Search Patient' })).toBeInTheDocument();
  });

  it('toggles search input when search button is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientSearchLaunch />);

    const searchButton = screen.getByTestId('searchPatientIcon');

    await user.click(searchButton);
    const searchInput = screen.getByText('Search results');
    expect(searchInput).toBeInTheDocument();

    const closeButton = screen.getByTestId('closeSearchIcon');
    await user.click(closeButton);
    expect(searchInput).not.toBeInTheDocument();
  });

  it('displays search input in overlay on mobile', async () => {
    const user = userEvent.setup();
    mockIsDesktop.mockReturnValue(false);

    render(<PatientSearchLaunch />);

    const searchButton = screen.getByTestId('searchPatientIcon');

    await user.click(searchButton);
    const overlay = screen.getByText('Search results');
    expect(overlay).toBeInTheDocument();
  });
});
