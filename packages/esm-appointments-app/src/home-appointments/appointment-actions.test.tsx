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

    renderActionsMenu({ appointment: mockAppointment, useBahmniUI: 'true' });

    fireEvent.click(screen.getByText(/Edit Appointment/i));
    fireEvent.click(screen.getByText(/Check In/i));
    fireEvent.click(screen.getByText(/Complete/i));
    fireEvent.click(screen.getByText(/Missed/i));
    fireEvent.click(screen.getByText(/Cancel/i));
    fireEvent.click(screen.getByText(/Add new appointment/i));

    expect(screen.getByText(/Edit Appointment/i)).toBeInTheDocument();
    expect(screen.getByText(/Check In/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete/i)).toBeInTheDocument();
    expect(screen.getByText(/Missed/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/Add new appointment/i)).toBeInTheDocument();
  });

  it('renders the actions menu with correct options and handlers in non-BahmniUI mode', () => {
    const mockAppointment = {
      id: '456',
      recurring: true,
      status: 'CheckedIn',
    };

    renderActionsMenu({ appointment: mockAppointment, useBahmniUI: undefined });

    fireEvent.click(screen.getByText(/Edit Appointment/i));
    fireEvent.click(screen.getByText(/Check In/i));
    fireEvent.click(screen.getByText(/Complete/i));
    fireEvent.click(screen.getByText(/Missed/i));
    fireEvent.click(screen.getByText(/Cancel/i));
    fireEvent.click(screen.getByText(/Add new appointment/i));

    expect(screen.getByText('Edit Appointment')).toBeInTheDocument();
    expect(screen.getByText('Check In')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    expect(screen.getByText('Missed')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Add new appointment')).toBeInTheDocument();
  });
});

function renderActionsMenu({ appointment, useBahmniUI }) {
  return render(<ActionsMenu appointment={appointment} useBahmniUI={useBahmniUI} />);
}
