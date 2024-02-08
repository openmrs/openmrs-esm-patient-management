import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import PatientSearchLaunch from './patient-search-icon.component';
import { isDesktop } from '@openmrs/esm-framework';

const isDesktopMock = isDesktop as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  isDesktop: jest.fn(),
  useOnClickOutside: jest.fn(),
  useConfig: jest.fn().mockReturnValue({ search: { disableTabletSearchOnKeyUp: false } }),
}));

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
    jest.clearAllMocks();
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
    isDesktopMock.mockReturnValue(false);

    render(<PatientSearchLaunch />);

    const searchButton = screen.getByTestId('searchPatientIcon');

    await user.click(searchButton);
    const overlay = screen.getByText('Search results');
    expect(overlay).toBeInTheDocument();
  });
});
