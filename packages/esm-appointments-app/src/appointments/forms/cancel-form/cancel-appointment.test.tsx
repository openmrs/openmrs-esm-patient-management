import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { cancelAppointment } from '../forms.resource';
import { mockMappedAppointmentsData } from '__mocks__';
import CancelAppointment from './cancel-appointment.component';

const testProps = {
  appointment: mockMappedAppointmentsData.data[0],
};

const mockShowSnackbar = showSnackbar as jest.Mock;
const mockCancelAppointment = cancelAppointment as jest.Mock;

jest.mock('../forms.resource', () => {
  const originalModule = jest.requireActual('../forms.resource');

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
  it('should update appointment status to cancelled and show snackbar with success message', async () => {
    const user = userEvent.setup();

    mockCancelAppointment.mockReturnValueOnce({ status: 200, statusText: 'Appointment cancelled' });

    renderCancelAppointment();

    await user.click(screen.getByRole('textbox', { name: /reason for changes/i }));
    await user.click(screen.getByRole('button', { name: /cancel appointment/i }));

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Appointment cancelled',
      subtitle: 'It has been cancelled successfully',
    });
  });

  it('should display an error message when rest api call to cancel appointment fails', async () => {
    const user = userEvent.setup();
    mockCancelAppointment.mockResolvedValueOnce({
      status: 500,
      responseBody: { error: { message: 'an error message' } },
    });

    renderCancelAppointment();

    await user.click(screen.getByRole('textbox', { name: /reason for changes/i }));
    await user.click(screen.getByRole('button', { name: /cancel appointment/i }));
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      kind: 'error',
      title: 'Error cancelling appointment',
      subtitle: 'Error cancelling the appointment',
    });
  });
});

function renderCancelAppointment() {
  render(<CancelAppointment {...testProps} />);
}
