import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { mockPastVisit } from '__mocks__';
import { mockPatient, renderWithSwr } from 'tools';
import { usePastVisits } from './past-visit.resource';
import PastVisit from './past-visit.component';

const mockUsePastVisits = vi.mocked(usePastVisits);

vi.mock('./past-visit.resource', () => ({
  usePastVisits: vi.fn(),
}));

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  ExtensionSlot: ({ name, state }: { name: string; state?: { visit?: { uuid?: string } } }) => (
    <div data-testid="extension-slot" data-slot-name={name}>
      visit-summary:{state?.visit?.uuid}
    </div>
  ),
}));

describe('PastVisit', () => {
  it('renders the most recent past visit header and the shared visit summary', () => {
    const pastVisit = mockPastVisit.data.results[0];
    mockUsePastVisits.mockReturnValueOnce({
      visits: pastVisit,
      error: null,
      isLoading: false,
      isValidating: false,
    });

    renderWithSwr(<PastVisit patientUuid={mockPatient.id} />);

    expect(screen.getByText(pastVisit.visitType.display)).toBeInTheDocument();
    const slot = screen.getByTestId('extension-slot');
    expect(slot).toBeInTheDocument();
    expect(slot).toHaveAttribute('data-slot-name', 'service-queues-past-visit-summary-slot');
    expect(slot).toHaveTextContent(`visit-summary:${pastVisit.uuid}`);
  });

  it('renders a loading skeleton while fetching', () => {
    mockUsePastVisits.mockReturnValueOnce({
      visits: null,
      error: null,
      isLoading: true,
      isValidating: false,
    });

    renderWithSwr(<PastVisit patientUuid={mockPatient.id} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a fallback when there is no previous visit', () => {
    mockUsePastVisits.mockReturnValueOnce({
      visits: null,
      error: null,
      isLoading: false,
      isValidating: false,
    });

    renderWithSwr(<PastVisit patientUuid={mockPatient.id} />);

    expect(screen.getByText('No previous visit found')).toBeInTheDocument();
  });
});
