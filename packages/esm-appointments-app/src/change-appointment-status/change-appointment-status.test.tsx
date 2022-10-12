import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import { changeAppointmentStatus } from './appointment-status.resource';
import { showNotification, showToast } from '@openmrs/esm-framework';
import { mockMappedAppointmentsData } from '../../../../__mocks__/appointments.mock';
import userEvent from '@testing-library/user-event';
import ChangeAppointmentStatusModal from './change-appointment-status.component';

const testProps = {
  appointment: mockMappedAppointmentsData.data[0],
  closeModal: () => false,
};

const selectedStatus = 'Cancelled';

const mockShowToast = showToast as jest.Mock;
const mockChangeAppointmentStatus = changeAppointmentStatus as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;

jest.mock('./appointment-status.resource', () => {
  const originalModule = jest.requireActual('./appointment-status.resource');

  return {
    ...originalModule,
    changeAppointmentStatus: jest.fn(),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
  };
});

describe('Change appointment status', () => {
  it('should change the status of an appointment', async () => {
    const user = userEvent.setup();

    mockChangeAppointmentStatus.mockResolvedValueOnce({
      data: mockMappedAppointmentsData.data[0],
      status: 200,
      statusText: 'Created',
    });

    renderChangePatientStatus();

    expect(screen.getByText(/patient name/i)).toBeInTheDocument();
    expect(screen.getByText(/john wilson/i)).toBeInTheDocument();
    expect(screen.getByText(/hiv clinic/i)).toBeInTheDocument();
    expect(screen.getByText(/service type/i)).toBeInTheDocument();
    expect(screen.getByText(/start time/i)).toBeInTheDocument();
    expect(screen.getByText(/30-Aug-2021, 03:35 PM/i)).toBeInTheDocument();

    await waitFor(() => user.click(screen.getByRole('button', { name: /change status/i })));

    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith({
      critical: true,
      kind: 'success',
      title: 'Appointment status',
      description: `Appointment status has been successfully changed to ${selectedStatus}`,
    });
  });

  it('should display error message when rest api call to update entry fails', async () => {
    const user = userEvent.setup();

    mockChangeAppointmentStatus.mockRejectedValue({
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    });

    renderChangePatientStatus();
    await waitFor(() => user.click(screen.getByRole('button', { name: /change status/i })));

    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(mockShowNotification).toHaveBeenCalledWith({
      critical: true,
      kind: 'error',
      title: 'Error updating appointment status',
      description: 'Internal Server Error',
    });
  });
});

function renderChangePatientStatus() {
  render(<ChangeAppointmentStatusModal {...testProps} />);
}
