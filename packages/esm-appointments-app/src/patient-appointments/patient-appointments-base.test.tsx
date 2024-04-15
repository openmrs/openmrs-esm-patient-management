import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockAppointmentsData } from '__mocks__';
import { mockPatient, patientChartBasePath, renderWithSwr, waitForLoadingToFinish } from 'tools';
import AppointmentsBase from './patient-appointments-base.component';

const testProps = {
  basePath: patientChartBasePath,
  patientUuid: mockPatient.id,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('AppointmensOverview', () => {
  it('renders an empty state if appointments data is unavailable', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });

    renderAppointments();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /appointments/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('renders an error state if there was a problem fetching appointments data', async () => {
    const error = {
      message: 'Internal server error',
      response: {
        status: 500,
        statusText: 'Internal server error',
      },
    };

    mockOpenmrsFetch.mockRejectedValueOnce(error);

    renderAppointments();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /appointments/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        'Sorry, there was a problem displaying this information. You can try to reload this page, or contact the site administrator and quote the error code above.',
      ),
    ).toBeInTheDocument();
  });

  it(`renders a tabular overview of the patient's appointment schedule if available`, async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce(mockAppointmentsData);

    renderAppointments();

    await waitForLoadingToFinish();

    expect(screen.getByRole('heading', { name: /appointments/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();

    const upcomingAppointmentsTab = screen.getByRole('tab', { name: /upcoming/i });
    const pastAppointmentsTab = screen.getByRole('tab', { name: /past/i });

    expect(screen.getByRole('tablist')).toContainElement(upcomingAppointmentsTab);
    expect(screen.getByRole('tablist')).toContainElement(pastAppointmentsTab);
    expect(screen.getByTitle(/Empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/There are no upcoming appointments to display for this patient/i)).toBeInTheDocument();

    await user.click(pastAppointmentsTab);
    expect(screen.getByRole('table')).toBeInTheDocument();

    const expectedColumnHeaders = [/date/, /location/, /service/];
    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });

    expect(screen.getAllByRole('row').length).toEqual(7); // 7 appts in mock data + header row

    const previousPageButton = screen.getByRole('button', { name: /previous page/i });
    const nextPageButton = screen.getByRole('button', { name: /next page/i });

    expect(previousPageButton).toBeDisabled();
    expect(nextPageButton).toBeDisabled();
  });
});

function renderAppointments() {
  renderWithSwr(<AppointmentsBase {...testProps} />);
}
