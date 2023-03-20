import React from 'react';
import { screen } from '@testing-library/react';
import PatientScheduledVisits from './patient-scheduled-visits.component';
import { renderWithSwr, waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockPatientsVisits } from '../../../../__mocks__/patient-visits.mock';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { mockSession } from '../../../../__mocks__/session.mock';
import { ConfigObject, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { mockPatient } from '../../../../__mocks__/appointments.mock';

const mockedUseConfig = useConfig as jest.Mock;
const mockToggleSearchType = jest.fn();
const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

const testProps = {
  toggleSearchType: mockToggleSearchType,
  patientUuid: mockPatient.uuid,
  closePanel: () => false,
};

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
    useLocations: jest.fn().mockImplementation(() => mockLocations.data),
    useSession: jest.fn().mockImplementation(() => mockSession.data),
  };
});
describe('ScheduledVisits', () => {
  beforeEach(() =>
    mockedUseConfig.mockReturnValue({
      concepts: {
        priorityConceptSetUuid: '96105db1-abbf-48d2-8a52-a1d561fd8c90',
        serviceConceptSetUuid: '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a',
        statusConceptSetUuid: 'd60ffa60-fca6-4c60-aea9-a79469ae65c7',
      },
    } as ConfigObject),
  );
  it('should display recent and future scheduled visits', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: mockPatientsVisits.recentVisits });

    renderPatientScheduledVisits();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Cardiology Consultation 1/i)).toBeInTheDocument();
    expect(screen.getByText(/08-Aug-2022, 02:56 PM · 10 Engineer VCT/i)).toBeInTheDocument();
    expect(screen.getByText(/No appointments found/i)).toBeInTheDocument();
  });
});

function renderPatientScheduledVisits() {
  renderWithSwr(<PatientScheduledVisits {...testProps} />);
}
