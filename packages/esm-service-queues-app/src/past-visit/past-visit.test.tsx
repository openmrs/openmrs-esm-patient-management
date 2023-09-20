import React from 'react';
import { screen } from '@testing-library/react';
import PastVisitSummary from './past-visit-details/past-visit-summary.component';
import userEvent from '@testing-library/user-event';
import { mockPastVisit } from '../../__mocks__/visits.mock';
import { mockPatient, renderWithSwr } from '../../../../tools/test-helpers';
import { usePastVisits } from './past-visit.resource';

const mockUsePastVisits = usePastVisits as jest.Mock;

jest.mock('./past-visit.resource', () => ({
  usePastVisits: jest.fn(),
}));

describe('PastVisit: ', () => {
  it('renders an empty state when notes, encounters, medications, and vitals data is not available', async () => {
    const user = userEvent.setup();

    mockUsePastVisits.mockReturnValueOnce({
      data: mockPastVisit.data.results,
    });

    renderPastVisitTabs();

    expect(screen.queryAllByText(/vitals/i));
    const vitalsTab = screen.getByRole('tab', { name: /vitals/i });

    expect(vitalsTab).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();

    await user.click(vitalsTab);

    expect(vitalsTab).toHaveAttribute('aria-selected', 'true');
  });
});

function renderPastVisitTabs() {
  renderWithSwr(<PastVisitSummary patientUuid={mockPatient.id} encounters={[]} />);
}
