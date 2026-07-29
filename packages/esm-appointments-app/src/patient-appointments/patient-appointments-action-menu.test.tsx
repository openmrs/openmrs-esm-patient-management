import React from 'react';
import { type Mock, vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import { type Appointment } from '../types';
import { PatientAppointmentsActionMenu } from './patient-appointments-action-menu.component';

const mockLaunchWorkspace2 = launchWorkspace2 as Mock;

const appointment = { uuid: 'appointment-uuid' } as Appointment;
const patientUuid = 'patient-uuid';

describe('PatientAppointmentsActionMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the provided launchAppointmentForm callback when editing an appointment', async () => {
    const user = userEvent.setup();
    const launchAppointmentForm = vi.fn();

    render(
      <PatientAppointmentsActionMenu
        appointment={appointment}
        patientUuid={patientUuid}
        launchAppointmentForm={launchAppointmentForm}
      />,
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText(/edit/i));

    expect(launchAppointmentForm).toHaveBeenCalledWith(patientUuid, appointment);
    expect(mockLaunchWorkspace2).not.toHaveBeenCalled();
  });

  it('falls back to the standalone appointments form workspace when no callback is provided', async () => {
    const user = userEvent.setup();

    render(<PatientAppointmentsActionMenu appointment={appointment} patientUuid={patientUuid} />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText(/edit/i));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('appointments-form-workspace', { appointment, patientUuid });
  });
});
