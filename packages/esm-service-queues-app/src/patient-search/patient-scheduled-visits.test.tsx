import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithSwr } from 'tools';
import { mockLocations, mockPatient, mockPatientsVisits, mockSession } from '__mocks__';
import { type ConfigObject, useConfig } from '@openmrs/esm-framework';
import PatientScheduledVisits from './patient-scheduled-visits.component';

const mockedUseConfig = useConfig as jest.Mock;
const mockToggleSearchType = jest.fn();

const testProps = {
  appointments: { recentVisits: mockPatientsVisits.recentVisits, futureVisits: [] },
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
      concepts: {},
    } as ConfigObject),
  );
  it('should display recent and future scheduled visits', async () => {
    renderPatientScheduledVisits();

    expect(screen.getByText(/Cardiology Consultation 1/i)).toBeInTheDocument();
    expect(screen.getByText(/08-Aug-2022, 02:56 PM · 10 Engineer VCT/i)).toBeInTheDocument();
    expect(screen.getByText(/No appointments found/i)).toBeInTheDocument();
  });
});

function renderPatientScheduledVisits() {
  renderWithSwr(<PatientScheduledVisits {...testProps} />);
}
