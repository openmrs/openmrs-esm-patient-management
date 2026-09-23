import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { getDefaultsFromConfigSchema, isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type PatientSearchConfig, configSchema } from '../config-schema';
import PatientSearchLaunch from './patient-search-icon.component';

const mockIsDesktop = vi.mocked(isDesktop);
const mockUseConfig = vi.mocked(useConfig<PatientSearchConfig>);
const mockUseParams = vi.mocked(useParams);
const mockUseLayoutType = vi.mocked(useLayoutType);

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) as object),
  useParams: vi.fn(() => ({})),
  useSearchParams: vi.fn(() => [
    {
      get: vi.fn(() => 'John'),
    },
  ]),
}));

describe('PatientSearchLaunch', () => {
  beforeEach(() => {
    mockIsDesktop.mockReturnValue(true);
    mockUseParams.mockReturnValue({});
    mockUseLayoutType.mockReturnValue('desktop');
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        ...getDefaultsFromConfigSchema(configSchema).search,
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
    mockIsDesktop.mockReturnValue(false);
    mockUseLayoutType.mockReturnValue('phone');
    render(<PatientSearchLaunch />);

    const searchButton = screen.getByTestId('searchPatientIcon');

    await user.click(searchButton);
    const searchInput = screen.getByText('Search results');
    expect(searchInput).toBeInTheDocument();

    const closeButton = screen.getByTestId('closeSearchIcon');
    await user.click(closeButton);
    expect(searchInput).not.toBeInTheDocument();
  });

  it('keeps the search input open on the search page on desktop', () => {
    mockIsDesktop.mockReturnValue(true);
    mockUseParams.mockReturnValue({ page: 'search' });

    render(<PatientSearchLaunch />);

    expect(screen.getByRole('searchbox')).toHaveValue('John');
  });

  it('renders nothing on the search page in tablet layout, where the page owns the overlay', () => {
    mockIsDesktop.mockReturnValue(false);
    mockUseLayoutType.mockReturnValue('tablet');
    mockUseParams.mockReturnValue({ page: 'search' });

    const { container } = render(<PatientSearchLaunch />);

    expect(container).toBeEmptyDOMElement();
  });

  it('keeps its overlay open on the search page in phone layout, where the page renders none', () => {
    mockIsDesktop.mockReturnValue(false);
    mockUseLayoutType.mockReturnValue('phone');
    mockUseParams.mockReturnValue({ page: 'search' });

    render(<PatientSearchLaunch />);

    expect(screen.getByText('Search results')).toBeInTheDocument();
  });

  it('displays search input in overlay on mobile', async () => {
    const user = userEvent.setup();
    mockIsDesktop.mockReturnValue(false);
    mockUseLayoutType.mockReturnValue('phone');

    render(<PatientSearchLaunch />);

    const searchButton = screen.getByTestId('searchPatientIcon');

    await user.click(searchButton);
    const overlay = screen.getByText('Search results');
    expect(overlay).toBeInTheDocument();
  });
});
