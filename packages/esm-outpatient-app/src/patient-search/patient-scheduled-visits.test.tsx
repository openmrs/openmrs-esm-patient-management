import React from 'react';
import { screen } from '@testing-library/react';
import { ScheduledVisits } from './patient-scheduled-visits.component';
import { renderWithSwr } from '../../../../tools/test-helpers';
import { mockRecentVisits } from '../../__mocks__/patient-scheduled-visits.mock';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
  };
});
describe('ScheduledVisits', () => {
  it('should display recent and future scheduled visits', async () => {
    renderScheduledVisits();

    expect(screen.getAllByText(/Cardiology Consultation 1/));
    expect(screen.getAllByText(/Today, 02:56 PM/));
  });
});

function renderScheduledVisits() {
  renderWithSwr(
    <ScheduledVisits
      visits={mockRecentVisits.recentVisits}
      visitType="WalkIn"
      scheduledVisitHeader="1 visit scheduled for +/- 7 days"
    />,
  );
}
