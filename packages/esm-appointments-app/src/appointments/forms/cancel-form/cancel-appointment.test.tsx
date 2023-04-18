import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import CancelAppointment from './cancel-appointment.component';
import { mockMappedAppointmentsData } from '../../../../../../__mocks__/appointments.mock';
import userEvent from '@testing-library/user-event';
import { showNotification, showToast } from '@openmrs/esm-framework';
import { cancelAppointment } from '../forms.resource';

const testProps = {
  appointment: mockMappedAppointmentsData.data[0],
};

const mockShowToast = showToast as jest.Mock;
const mockCancelAppointment = cancelAppointment as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;

jest.mock('../forms.resource.ts', () => {
  const originalModule = jest.requireActual('../forms.resource.ts');

  return {
    ...originalModule,
    cancelAppointment: jest.fn(),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
  };
});

describe('Cancel appointment form', () => {
  it('should update appointment status to cancelled and show toast with success message', async () => {
    const user = userEvent.setup();

    mockCancelAppointment.mockReturnValueOnce({ status: 200, statusText: 'Appointment cancelled' });

    renderCancelAppointment();

    await waitFor(() => user.click(screen.getByRole('textbox', { name: /reason for changes/i })));
    await waitFor(() => user.click(screen.getByRole('button', { name: /cancel appointment/i })));

    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith({
      critical: true,
      kind: 'success',
      title: 'Appointment cancelled',
      description: 'It has been cancelled successfully',
    });
  });
  it('should display an error message when rest api call to cancel appointment fails', async () => {
    const user = userEvent.setup();
    mockCancelAppointment.mockResolvedValueOnce({
      status: 500,
      responseBody: { error: { message: 'an error message' } },
    });

    renderCancelAppointment();

    await waitFor(() => user.click(screen.getByRole('textbox', { name: /reason for changes/i })));
    await waitFor(() => user.click(screen.getByRole('button', { name: /cancel appointment/i })));
    expect(mockShowNotification).toHaveBeenCalledTimes(1);
    expect(mockShowNotification).toHaveBeenCalledWith({
      critical: true,
      kind: 'error',
      title: 'Error cancelling appointment',
      description: 'Error cancelling the appointment',
    });
  });
});

function renderCancelAppointment() {
  render(<CancelAppointment {...testProps} />);
}
