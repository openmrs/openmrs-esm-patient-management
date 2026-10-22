import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import { mockPastVisit } from '__mocks__';
import { mockPatient, renderWithSwr } from 'tools';
import { usePastVisits } from './past-visit.resource';
import PastVisit from './past-visit.component';

const mockUsePastVisits = vi.mocked(usePastVisits);
const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockUsePatient = vi.mocked(usePatient);

vi.mock('./past-visit.resource', () => ({
  usePastVisits: vi.fn(),
}));

describe('PastVisit', () => {
  beforeEach(() => {
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      patientUuid: mockPatient.id,
      isLoading: false,
      error: null,
    });
  });

  it('renders the most recent past visit header and the shared visit summary', () => {
    const pastVisit = mockPastVisit.data.results[0];
    mockUsePastVisits.mockReturnValueOnce({
      visits: pastVisit,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    renderWithSwr(<PastVisit patientUuid={mockPatient.id} />);

    expect(screen.getByText(pastVisit.visitType.display)).toBeInTheDocument();
    expect(mockExtensionSlot.mock.calls.map(([props]) => props)).toContainEqual(
      expect.objectContaining({
        name: 'service-queues-past-visit-summary-slot',
        state: expect.objectContaining({
          visit: pastVisit,
          patientUuid: mockPatient.id,
          patient: mockPatient,
          onEditEncounter: expect.any(Function),
          mutateVisitContext: expect.any(Function),
        }),
      }),
    );
  });

  it('renders a loading skeleton while fetching', () => {
    mockUsePastVisits.mockReturnValueOnce({
      visits: null,
      error: null,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
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
      mutate: vi.fn(),
    });

    renderWithSwr(<PastVisit patientUuid={mockPatient.id} />);

    expect(screen.getByText('No previous visit found')).toBeInTheDocument();
  });
});
