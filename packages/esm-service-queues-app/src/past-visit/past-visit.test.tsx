import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockPastVisit } from '__mocks__';
import { mockPatient, renderWithSwr } from 'tools';
import { configSchema, type ConfigObject } from '../config-schema';
import { usePastVisits } from './past-visit.resource';
import PastVisit from './past-visit.component';

const mockUsePastVisits = vi.mocked(usePastVisits);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

vi.mock('./past-visit.resource', () => ({
  usePastVisits: vi.fn(),
}));

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  VisitSummary: ({ visit }: { visit: { uuid?: string } }) => (
    <div data-testid="visit-summary">visit-summary:{visit?.uuid}</div>
  ),
}));

describe('PastVisit', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
    });
  });

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
    expect(screen.getByTestId('visit-summary')).toBeInTheDocument();
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
