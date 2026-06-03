import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Encounter, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockPastVisit } from '__mocks__';
import { mockPatient, renderWithSwr } from 'tools';
import { configSchema, type ConfigObject } from '../config-schema';
import { usePastVisits } from './past-visit.resource';
import PastVisitSummary from './past-visit-details/past-visit-summary.component';

const mockUsePastVisits = vi.mocked(usePastVisits);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

vi.mock('./past-visit.resource', () => ({
  usePastVisits: vi.fn(),
}));

describe('PastVisit', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
    });
  });

  it('renders an empty state when notes, encounters, medications, and vitals data is not available', async () => {
    const user = userEvent.setup();

    mockUsePastVisits.mockReturnValueOnce({
      visits: mockPastVisit.data.results[0],
      error: null,
      isLoading: false,
      isValidating: false,
    });

    renderWithSwr(<PastVisitSummary patientUuid={mockPatient.id} encounters={[]} />);

    expect(screen.queryAllByText(/vitals/i));
    const vitalsTab = screen.getByRole('tab', { name: /vitals/i });
    expect(vitalsTab).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /notes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /medications/i })).toBeInTheDocument();
    await user.click(vitalsTab);
    expect(vitalsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('renders a Visit Note encounter note exactly once (no duplication)', async () => {
    const user = userEvent.setup();
    const { generalPatientNoteConceptUuid } = getDefaultsFromConfigSchema(configSchema).concepts;

    const encounter = {
      uuid: 'enc-1',
      encounterDatetime: '2026-05-12T22:11:00.000+0000',
      encounterType: { uuid: 'visit-note-type', display: 'Visit Note' },
      encounterProviders: [
        {
          uuid: 'ep-1',
          display: 'Super User',
          encounterRole: { uuid: 'role-1', display: 'Clinician' },
          provider: { uuid: 'p-1', person: { uuid: 'person-1', display: 'Super User' } },
        },
      ],
      obs: [
        {
          uuid: 'obs-1',
          concept: { uuid: generalPatientNoteConceptUuid, display: 'General patient note' },
          value: 'DNTBFGD',
        },
      ],
    } as unknown as Encounter;

    renderWithSwr(<PastVisitSummary patientUuid={mockPatient.id} encounters={[encounter]} />);

    await user.click(screen.getByRole('tab', { name: /notes/i }));

    const notesPanel = screen.getByRole('tabpanel', { name: /notes/i });
    expect(within(notesPanel).getAllByText('DNTBFGD')).toHaveLength(1);
    expect(within(notesPanel).getByText(/10:11\s*PM/i)).toBeInTheDocument();
  });
});
