import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionsMenu } from './appointment-actions.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(() => mockUseConfig),
  useSWRConfig: jest.fn(),
  navigate: jest.fn(),
}));

jest.mock('@carbon/react', () => ({
  Layer: ({ children }) => children,
  OverflowMenu: ({ children }) => <div>{children}</div>,
  OverflowMenuItem: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

jest.mock('./common', () => ({
  handleUpdateStatus: jest.fn(),
  handleComplete: jest.fn(),
  launchCheckInAppointmentModal: jest.fn(),
}));

const mockUseConfig = {
  bahmniAppointmentsUiBaseUrl: 'https://example.com',
};

describe('ActionsMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the actions menu with correct options and handlers', () => {
    const mockAppointment = {
      id: '123',
      recurring: false,
      status: 'Scheduled',
    };

    const { getByText } = render(<ActionsMenu appointment={mockAppointment} useBahmniUI="true" />);

    fireEvent.click(getByText('Edit Appointment'));
    fireEvent.click(getByText('Check In'));
    fireEvent.click(getByText('Complete'));
    fireEvent.click(getByText('Missed'));
    fireEvent.click(getByText('Cancel'));
    fireEvent.click(getByText('Add new appointment'));

    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    expect(screen.getByText('Check In')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Missed')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add new appointment')).toBeInTheDocument();
  });

  it('renders the actions menu with correct options and handlers in non-BahmniUI mode', () => {
    const mockAppointment = {
      id: '456',
      recurring: true,
      status: 'CheckedIn',
    };

    const { getByText } = render(<ActionsMenu appointment={mockAppointment} useBahmniUI={undefined} />);

    fireEvent.click(getByText('Edit Appointment'));
    fireEvent.click(getByText('Check In'));
    fireEvent.click(getByText('Complete'));
    fireEvent.click(getByText('Missed'));
    fireEvent.click(getByText('Cancel'));
    fireEvent.click(getByText('Add new appointment'));

    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    expect(screen.getByText('Check In')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Missed')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add new appointment')).toBeInTheDocument();
  });
});
