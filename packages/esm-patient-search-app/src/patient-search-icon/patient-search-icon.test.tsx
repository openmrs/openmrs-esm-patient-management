import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import PatientSearchLaunch from './patient-search-icon.component';
import { isDesktop } from '@openmrs/esm-framework';

const isDesktopMock = isDesktop as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  isDesktop: jest.fn(),
  useOnClickOutside: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({
    page: 1,
  })),
  useLocation: jest.fn(),
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
  });

  it('toggles search input when search button is clicked', () => {
    render(<PatientSearchLaunch />);
    const searchButton = screen.getByTestId('searchPatientIcon');

    fireEvent.click(searchButton);
    const searchInput = screen.getByText('Search results');
    expect(searchInput).toBeInTheDocument();

    fireEvent.click(searchButton);
    expect(searchInput).not.toBeInTheDocument();
  });

  it('displays search input in overlay on mobile', () => {
    isDesktopMock.mockReturnValue(false);
    render(<PatientSearchLaunch />);
    const searchButton = screen.getByTestId('searchPatientIcon');

    fireEvent.click(searchButton);
    const overlay = screen.getByText('Search results');
    expect(overlay).toBeInTheDocument();
  });
});
