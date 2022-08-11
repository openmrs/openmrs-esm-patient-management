import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { mockPastAndUpcomingAppointments } from '../../__mocks__/appointments-data.mock';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import AppointmentDetails from './appointment-details.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('RecentandUpcomingAppointments', () => {
  it('renders recent and upcoming appointment if available', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockPastAndUpcomingAppointments });
    renderAppointments();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Last encounter/)).toBeInTheDocument();
    expect(screen.getByText(/28-Oct-2021, 11:14 AM · HIV return visit · Outpatient Clinic/)).toBeInTheDocument();
    expect(screen.getByText(/Return date/)).toBeInTheDocument();
    expect(screen.getByText(/14-Apr-2022, 11:00 AM · Clinical observation · Outpatient Clinic/)).toBeInTheDocument();
  });
});

const renderAppointments = () => {
  renderWithSwr(<AppointmentDetails {...testProps} />);
};
