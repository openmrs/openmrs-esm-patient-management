import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { updateAppointmentStatus } from '../home-appointments.resource';
import { showActionableNotification, showNotification } from '@openmrs/esm-framework';
import CheckInAppointmentModal from './check-in-modal.component';

const mockUpdateAppointmentStatus = updateAppointmentStatus as jest.Mock;
const appointmentUuid = '7cd38a6d-377e-491b-8284-b04cf8b8c6d8';

jest.mock('@openmrs/esm-framework');
jest.mock('../appointments-table.resource');

describe('CheckInAppointmentModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submits and displays success notification', async () => {
    const user = await userEvent.setup();

    mockUpdateAppointmentStatus.mockResolvedValue({ status: 200 });
    const closeCheckInModal = jest.fn();

    render(<CheckInAppointmentModal closeCheckInModal={closeCheckInModal} appointmentUuid={appointmentUuid} />);

    await user.type(screen.getByRole('textbox'), '10:30');
    await user.click(screen.getByText('Yes'));

    expect(closeCheckInModal).toHaveBeenCalled();
    expect(showActionableNotification).toHaveBeenCalled();
  });

  it('displays error notification on submit failure', async () => {
    const user = userEvent.setup();

    mockUpdateAppointmentStatus.mockResolvedValue({ status: 400 });
    const closeCheckInModal = jest.fn();

    render(<CheckInAppointmentModal closeCheckInModal={closeCheckInModal} appointmentUuid={appointmentUuid} />);

    const input = screen.getByRole('textbox');

    await user.type(input, '10:30');
    await user.click(screen.getByText('Yes'));

    expect(showNotification).toHaveBeenCalled();
  });

  it('closes modal on "No" button click', async () => {
    const user = userEvent.setup();

    const closeCheckInModal = jest.fn();

    render(<CheckInAppointmentModal closeCheckInModal={closeCheckInModal} appointmentUuid={appointmentUuid} />);

    await user.click(screen.getByText('No'));

    expect(closeCheckInModal).toHaveBeenCalled();
  });
});
