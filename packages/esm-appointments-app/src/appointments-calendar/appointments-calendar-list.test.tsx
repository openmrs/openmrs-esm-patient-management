import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockAppointmentsData } from '../../../../__mocks__/appointments.mock';
import AppointmentsCalendarListView from './appointments-calendar-list-view.component';
import { waitForLoadingToFinish } from '../../../../tools/test-helpers';
import userEvent from '@testing-library/user-event';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../hooks/useAppointments'),
  () => ({
    useDailyAppointments: jest.fn(),
    useAppointmentsByDurationPeriod: jest.fn(),
  });

describe('Appointment calendar view', () => {
  it('renders appointments in calendar view from appointments list', async () => {
    const user = userEvent.setup();
    mockedOpenmrsFetch.mockResolvedValue({ data: mockAppointmentsData.data });

    renderAppointmentsCalendarListView();

    await waitForLoadingToFinish();

    expect(screen.getByText(/clinical appointments/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /DD-MMM-YYYY/i })).toBeInTheDocument();
    expect(screen.getByText(/add new clinic day/i)).toBeInTheDocument();
    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /filter/i })).toBeInTheDocument();

    const dailyAppointmentsTab = screen.getByRole('tab', { name: /daily/i });
    const weeklyAppointmentsTab = screen.getByRole('tab', { name: /weekly/i });
    const monthlyAppointmentsTab = screen.getByRole('tab', { name: /monthly/i });

    expect(screen.getByRole('tablist')).toContainElement(dailyAppointmentsTab);
    expect(screen.getByRole('tablist')).toContainElement(weeklyAppointmentsTab);
    expect(screen.getByRole('tablist')).toContainElement(monthlyAppointmentsTab);

    const expectedColumnHeaders = [/patient name/, /date/, /start time/, /end time/, /provider/, /service/, /comments/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    const expectedTableRows = [
      /John Wilson 30-Aug-2021 03:35 03:35 Dr James Cook Outpatient Walk in appointments/,
      /Neil Amstrong 10-Sept-2021 03:50 03:50 Dr James Cook Outpatient Some additional notes/,
    ];

    expectedTableRows.forEach((row) => {
      expect(screen.queryByRole('row', { name: new RegExp(row, 'i') })).not.toBeInTheDocument();
    });

    await waitFor(() => user.click(weeklyAppointmentsTab));
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders an empty state if appointments data is unavailable', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: [] });

    renderAppointmentsCalendarListView();

    await waitForLoadingToFinish();

    expect(screen.getByText(/clinical appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/appointment list is empty/i)).toBeInTheDocument();
  });
});

function renderAppointmentsCalendarListView() {
  render(<AppointmentsCalendarListView />);
}
