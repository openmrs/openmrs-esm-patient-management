import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckInAppointmentModal from './check-in-modal.component';
import { showActionableNotification, showNotification } from '@openmrs/esm-framework';
import { updateAppointmentStatus } from '../appointments-table.resource';

const mockUpdateAppointmentStatus = updateAppointmentStatus as jest.Mock;
const appointmentUuid = '7cd38a6d-377e-491b-8284-b04cf8b8c6d8';

jest.mock('@openmrs/esm-framework');
jest.mock('../appointments-table.resource');

describe('CheckInAppointmentModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('submits and displays success notification', async () => {
    mockUpdateAppointmentStatus.mockResolvedValue({ status: 200 });
    const closeCheckInModal = jest.fn();

    render(<CheckInAppointmentModal closeCheckInModal={closeCheckInModal} appointmentUuid={appointmentUuid} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '10:30' } });
    fireEvent.click(screen.getByText('Yes'));

    await waitFor(() => {
      expect(closeCheckInModal).toHaveBeenCalled();
      expect(showActionableNotification).toHaveBeenCalled();
    });
  });

  it('displays error notification on submit failure', async () => {
    mockUpdateAppointmentStatus.mockResolvedValue({ status: 400 });
    const closeCheckInModal = jest.fn();

    render(<CheckInAppointmentModal closeCheckInModal={closeCheckInModal} appointmentUuid={appointmentUuid} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '10:30' } });
    fireEvent.click(screen.getByText('Yes'));

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalled();
    });
  });

  it('closes modal on "No" button click', () => {
    const closeCheckInModal = jest.fn();

    render(<CheckInAppointmentModal closeCheckInModal={closeCheckInModal} appointmentUuid={appointmentUuid} />);

    fireEvent.click(screen.getByText('No'));

    expect(closeCheckInModal).toHaveBeenCalled();
  });
});
