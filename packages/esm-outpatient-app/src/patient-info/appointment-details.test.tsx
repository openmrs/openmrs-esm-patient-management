import React from 'react';
import { screen } from '@testing-library/react';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import AppointmentDetails from './appointment-details.component';

const testProps = {
  patientUuid: mockPatient.id,
};

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('RecentandUpcomingAppointments', () => {
  it('renders no data if past and upcoming visit is empty', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });
    mockOpenmrsFetch.mockReturnValueOnce({ data: [] });
    renderAppointments();

    await waitForLoadingToFinish();

    expect(screen.getByText(/there is no last encounter to display for this patient/i)).toBeInTheDocument();
    expect(screen.getByText(/there is no return date to display for this patient/i)).toBeInTheDocument();
  });
});

const renderAppointments = () => {
  renderWithSwr(<AppointmentDetails {...testProps} />);
};
