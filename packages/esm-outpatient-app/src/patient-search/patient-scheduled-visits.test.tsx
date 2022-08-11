import React from 'react';
import { screen } from '@testing-library/react';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import { mockPatient } from '../../../../__mocks__/patient.mock';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockRecentVisits } from '../../__mocks__/patient-scheduled-visits.mock';
import { openmrsFetch } from '@openmrs/esm-framework';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

const mockToggleSearchType = jest.fn();

describe('Scheduled visits', () => {
  it('should display recent and future scheduled visits', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockRecentVisits });
    renderScheduledVisits();
    await waitForLoadingToFinish();

    expect(screen.getByText(/Adult diabetes return visit/)).toBeInTheDocument();
    expect(screen.getByText(/NCD clinic/)).toBeInTheDocument();
    expect(screen.getAllByText(/Adult HIV return visit/));
    expect(screen.getAllByText(/ HIV clinic/));
    expect(screen.getAllByText(/23-Feb-2022, 10:44 PM/));
  });
});

const renderScheduledVisits = () => {
  renderWithSwr(<PatientScheduledVisits patientUuid={mockPatient.id} toggleSearchType={mockToggleSearchType} />);
};
