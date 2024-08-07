import React from 'react';
import { of } from 'rxjs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { updateVisit, showSnackbar, useVisit, type VisitReturnType } from '@openmrs/esm-framework';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import EndAppointmentModal from './end-appointment.modal';

const closeModal = jest.fn();
const mockUseVisit = jest.mocked(useVisit);
const mockUpdateVisit = jest.mocked(updateVisit);

jest.mock('../../patient-appointments/patient-appointments.resource', () => ({
  changeAppointmentStatus: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../form/appointments-form.resource', () => ({
  useMutateAppointments: jest.fn().mockReturnValue({ mutateAppointments: jest.fn() }),
}));

describe('EndAppointmentModal', () => {
  beforeEach(() => {
    mockUpdateVisit.mockImplementation(() => of({}));
  });

  it('has a cancel button that closes the modal', async () => {
    const user = userEvent.setup();

    render(<EndAppointmentModal appointmentUuid={'abc'} patientUuid={'123'} closeModal={closeModal} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('should update appointment status but not visit on submit if no active visit', async () => {
    const user = userEvent.setup();

    render(<EndAppointmentModal appointmentUuid={'abc'} patientUuid={'123'} closeModal={closeModal} />);

    const submitButton = screen.getByRole('button', { name: /check out/i });
    expect(submitButton).toBeEnabled();

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
    const user = userEvent.setup();

    mockUseVisit.mockReturnValue({
      activeVisit: { location: { uuid: 'def' }, visitType: { uuid: 'ghi' }, startDatetime: new Date() },
      mutate: jest.fn(),
    } as unknown as VisitReturnType);

    render(<EndAppointmentModal appointmentUuid={'abc'} patientUuid={'123'} closeModal={closeModal} />);

    const submitButton = screen.getByRole('button', { name: /check out/i });
    expect(submitButton).toBeEnabled();
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
