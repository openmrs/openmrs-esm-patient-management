import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, isDesktop, useConfig } from '@openmrs/esm-framework';
import { type PatientSearchConfig, configSchema } from '../config-schema';
import PatientSearchLaunch from './patient-search-icon.component';

const mockIsDesktop = vi.mocked(isDesktop);
const mockUseConfig = vi.mocked(useConfig<PatientSearchConfig>);

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) as object),
  useSearchParams: vi.fn(() => [
    {
      get: vi.fn(() => 'John'),
    },
  ]),
}));

describe('PatientSearchLaunch', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        disableTabletSearchOnKeyUp: false,
        showRecentlySearchedPatients: false,
      } as PatientSearchConfig['search'],
    });
  });

  it('renders without errors', () => {
    render(<PatientSearchLaunch />);
    expect(screen.getByRole('button', { name: /search patient/i })).toBeInTheDocument();
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
