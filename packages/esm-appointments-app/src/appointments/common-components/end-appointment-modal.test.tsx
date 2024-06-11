import EndAppointmentModal from './end-appointment-modal.component';
import { render, screen } from '@testing-library/react';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { updateVisit, showSnackbar, useVisit } from '@openmrs/esm-framework';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';

const closeModal = jest.fn();
jest.mock('../../patient-appointments/patient-appointments.resource', () => ({
  changeAppointmentStatus: jest.fn().mockResolvedValue({}),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useVisit: jest.fn(),
  updateVisit: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue({}) }),
  showSnackbar: jest.fn(),
  parseDate: jest.fn(),
}));

describe('EndAppointmentModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('has a cancel button that closes the model', async () => {
    useVisit.mockReturnValue({});
    const user = userEvent.setup();
    render(<EndAppointmentModal appointmentUuid={'abc'} patientUuid={'123'} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('should update appointment status but not visit on submit if no active visit', async () => {
    useVisit.mockReturnValue({});
    const user = userEvent.setup();

    render(<EndAppointmentModal appointmentUuid={'abc'} patientUuid={'123'} closeModal={closeModal} />);

    const submitButton = screen.getByRole('button', { name: /check out/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(changeAppointmentStatus).toHaveBeenCalledWith('Completed', 'abc');
    expect(useVisit).toHaveBeenCalledWith('123');
    expect(updateVisit).not.toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'Appointment ended',
      subtitle: 'Appointment successfully ended.',
      isLowContrast: true,
      kind: 'success',
    });
  });

  it('should update appointment status and visit on submit if active visit', async () => {
    useVisit.mockReturnValue({
      mutate: jest.fn(),
      activeVisit: { location: { uuid: 'def' }, visitType: { uuid: 'ghi' }, startDatetime: new Date() },
    });
    const user = userEvent.setup();

    render(<EndAppointmentModal appointmentUuid={'abc'} patientUuid={'123'} closeModal={closeModal} />);

    const submitButton = screen.getByRole('button', { name: /check out/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(changeAppointmentStatus).toHaveBeenCalledWith('Completed', 'abc');
    expect(useVisit).toHaveBeenCalledWith('123');
    expect(updateVisit).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalledWith({
      title: 'Appointment ended',
      subtitle: 'Appointment successfully ended and visit successfully closed.',
      isLowContrast: true,
      kind: 'success',
    });
  });
});
