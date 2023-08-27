import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import PatientListList from './patient-list-list.component';

const mockUseLocation = useLocation as jest.Mock;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useSession: jest.fn(() => ({
    user: {
      uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
    },
  })),
  navigate: jest.fn(),
}));

describe('PatientListList', () => {
  beforeEach(() => {
    mockUseLocation.mockReturnValue({
      pathname: '/',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    });
  });

  it('renders tabs and table correctly', () => {
    render(<PatientListList />);

    expect(screen.getByText('Starred lists')).toBeInTheDocument();
    expect(screen.getByText('System lists')).toBeInTheDocument();
    expect(screen.getByText('My lists')).toBeInTheDocument();
    expect(screen.getByText('All lists')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('clicking tabs updates the selected tab', () => {
    render(<PatientListList />);

    const systemListsTab = screen.getByRole('tab', { name: 'System lists' });
    expect(systemListsTab).toHaveAttribute('aria-selected', 'false');
    fireEvent.click(systemListsTab);

    expect(systemListsTab).toHaveAttribute('aria-selected', 'true');
  });
});
