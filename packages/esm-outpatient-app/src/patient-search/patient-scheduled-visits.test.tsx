import React from 'react';
import { screen } from '@testing-library/react';
import { ScheduledVisits } from './patient-scheduled-visits.component';
import { renderWithSwr } from '../../../../tools/test-helpers';
import { mockRecentVisits } from '../../__mocks__/patient-scheduled-visits.mock';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { mockSession } from '../../../../__mocks__/session.mock';
import { ConfigObject, useConfig } from '@openmrs/esm-framework';

const mockedUseConfig = useConfig as jest.Mock;

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
      },
    } as ConfigObject),
  );
  it('should display recent and future scheduled visits', async () => {
    renderScheduledVisits();

    expect(screen.getAllByText(/Cardiology Consultation 1/));
    expect(screen.getAllByText(/08-Aug-2022, 02:56 PM/));
  });
});

function renderScheduledVisits() {
  renderWithSwr(
    <ScheduledVisits
      visits={mockRecentVisits.recentVisits}
      visitType="WalkIn"
      scheduledVisitHeader="1 visit scheduled for +/- 7 days"
      patientUuid={mockRecentVisits.recentVisits[0].patient.uuid}
      closePanel={() => false}
    />,
  );
}
