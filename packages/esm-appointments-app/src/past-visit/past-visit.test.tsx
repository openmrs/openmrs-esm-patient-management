import React from 'react';
import { render, screen } from '@testing-library/react';
import PastVisit from './past-visit.component';
import userEvent from '@testing-library/user-event';
import { mockPatient } from '../../../../__mocks__/patient.mock';

jest.mock('./past-visit.resource.ts', () => {
  const originalModule = jest.requireActual('./past-visit.resource.ts');

  return {
    ...originalModule,
  };
});

describe('PastVisit: ', () => {
  it('renders an empty state for notes, encounters, medications, and vitals', () => {
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
  render(<PastVisit patientUuid={mockPatient.id} />);
}
