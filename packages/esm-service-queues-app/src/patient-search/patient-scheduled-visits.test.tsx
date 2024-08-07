import React from 'react';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useLocations, useSession } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import { mockLocations, mockPatient, mockPatientsVisits, mockSession } from '__mocks__';
import PatientScheduledVisits from './patient-scheduled-visits.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockToggleSearchType = jest.fn();
const mockUseLocations = useLocations as jest.Mock;
const mockUseSession = jest.mocked(useSession);

const defaultProps = {
  appointments: { recentVisits: mockPatientsVisits.recentVisits, futureVisits: [] },
  closePanel: () => false,
  closeWorkspace: jest.fn(),
  patientUuid: mockPatient.uuid,
  toggleSearchType: mockToggleSearchType,
};

describe('ScheduledVisits', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      concepts: {},
    } as ConfigObject);
    mockUseLocations.mockReturnValue(mockLocations.data.results);
    mockUseSession.mockReturnValue(mockSession.data);
  });

  it('should display recent and future scheduled visits', async () => {
    renderWithSwr(<PatientScheduledVisits {...defaultProps} />);

    expect(screen.getByText(/Cardiology Consultation 1/i)).toBeInTheDocument();
    expect(screen.getByText(/08-Aug-2022, 02:56 PM · 10 Engineer VCT/i)).toBeInTheDocument();
    expect(screen.getByText(/No appointments found/i)).toBeInTheDocument();
  });
});
