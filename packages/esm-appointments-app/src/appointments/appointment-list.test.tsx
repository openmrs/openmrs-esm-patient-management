import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch } from '@openmrs/esm-framework';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import AppointmentList from './appointment-list.component';
import { mockAppointmentsData } from '../../../../__mocks__/appointments.mock';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.setTimeout(15000);

describe('AppointmentList', () => {
  it(`renders tabs showing different appointment lists`, async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce({ data: mockAppointmentsData.data });

    renderAppointmentList();

    await waitForLoadingToFinish();

    const scheduledAppointmentsTab = screen.getByRole('tab', { name: /scheduled/i });
    const completedAppointmentsTab = screen.getByRole('tab', { name: /completed/i });
    const cancelledAppointmentsTab = screen.getByRole('tab', { name: /cancelled/i });

    expect(scheduledAppointmentsTab).toBeInTheDocument();
    expect(completedAppointmentsTab).toBeInTheDocument();
    expect(cancelledAppointmentsTab).toBeInTheDocument();

    expect(scheduledAppointmentsTab).toHaveAttribute('aria-selected', 'true');
    expect(completedAppointmentsTab).toHaveAttribute('aria-selected', 'false');
    expect(cancelledAppointmentsTab).toHaveAttribute('aria-selected', 'false');

    expect(screen.getByRole('button', { name: /add new appointment/i })).toBeInTheDocument();
    expect(screen.getByText(/view calendar/i)).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    const expectedColumnHeaders = [/name/, /date & time/, /service type/, /provider/, /location/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /John Wilson 10-Sept-2021, 12:50 PM Outpatient Dr James Cook HIV Clinic Checked In open and close list of options/,
      /John Wilson 14-Sept-2021, 12:50 PM Outpatient Dr James Cook TB Clinic Checked In open and close list of options/,
      /John Wilson 14-Sept-2021, 07:50 AM Outpatient -- HIV Clinic Checked In open and close list of options/,
    ];

    expectedTableRows.forEach((row) => {
      expect(screen.getByRole('row', { name: new RegExp(row, 'i') })).toBeInTheDocument();
    });

    await waitFor(() => user.click(completedAppointmentsTab));

    expect(scheduledAppointmentsTab).toHaveAttribute('aria-selected', 'false');
    expect(cancelledAppointmentsTab).toHaveAttribute('aria-selected', 'false');
    expect(completedAppointmentsTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.getByText(/add new appointment/i)).toBeInTheDocument();
  });
});

function renderAppointmentList() {
  renderWithSwr(<AppointmentList />);
}
