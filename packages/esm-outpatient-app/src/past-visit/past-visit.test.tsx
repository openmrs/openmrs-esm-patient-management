import React from 'react';
import { screen } from '@testing-library/react';
import PastVisit from './past-visit.component';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../__mocks__/patient.mock';
import { mockPastVisit } from '../../__mocks__/visits.mock';
import { renderWithSwr } from '../../../../tools/test-helpers';
import * as mockPastVisitResource from './past-visit.resource';

describe('PastVisit: ', () => {
  it('renders an empty state for notes, encounters, medications, and vitals', () => {
    spyOn(mockPastVisitResource, 'usePastVisits').and.returnValue({ data: mockPastVisit.data.results });
    renderPastVisitTabs();

    expect(screen.getByText(/vitals/i)).toBeInTheDocument();
    const vitalsTab = screen.getByRole('tab', { name: /vitals/i });
    const encountersTab = screen.getByRole('tab', { name: /encounters/i });

    expect(vitalsTab).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /^encounters$/i })).toBeInTheDocument();

    userEvent.click(vitalsTab);

    expect(vitalsTab).toHaveAttribute('aria-selected', 'true');
    expect(encountersTab).toHaveAttribute('aria-selected', 'false');
  });
});

function renderPastVisitTabs() {
  renderWithSwr(<PastVisit patientUuid={mockPatient.id} />);
}
