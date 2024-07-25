import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { renderWithSwr, waitForLoadingToFinish } from 'tools';
import { mockAppointmentsData } from '__mocks__';
import AppointmentTabs from './appointment-tabs.component';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('AppointmentTabs', () => {
  xit(`renders tabs showing different appointment lists`, async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockAppointmentsData.data });

    renderAppointmentTabs();

    await waitForLoadingToFinish();

    const scheduledAppointmentsTab = screen.getByRole('tab', { name: /^scheduled$/i });
    const unsheduledAppointment = screen.getByRole('tab', { name: /^unscheduled$/i });
    const pendingAppointments = screen.getByRole('tab', { name: /^unscheduled$/i });

    expect(scheduledAppointmentsTab).toBeInTheDocument();
    expect(unsheduledAppointment).toBeInTheDocument();
    expect(pendingAppointments).toBeInTheDocument();

    expect(scheduledAppointmentsTab).toHaveAttribute('aria-selected', 'true');
    expect(unsheduledAppointment).toHaveAttribute('aria-selected', 'false');
    expect(pendingAppointments).toHaveAttribute('aria-selected', 'false');

    expect(screen.getByRole('button', { name: /add new appointment/i })).toBeInTheDocument();
    expect(screen.getByText(/view calendar/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    const expectedColumnHeaders = [/name/, /date & time/, /service type/, /provider/, /location/, /actions/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /John Wilson 30-Aug-2021, 12:35 PM Outpatient HIV Clinic/,
      /Elon Musketeer 14-Sept-2021, 07:50 AM Outpatient HIV Clinic/,
      /Hopkins Derrick 14-Sept-2021, 12:50 PM Outpatient TB Clinic/,
      /Amos Strong 15-Sept-2021, 01:32 PM Outpatient TB Clinic/,
    ];
    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });
  });
});

function renderAppointmentTabs() {
  renderWithSwr(<AppointmentTabs appointmentServiceType="" />);
}
