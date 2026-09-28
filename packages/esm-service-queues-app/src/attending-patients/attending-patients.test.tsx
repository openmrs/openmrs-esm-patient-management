import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../config-schema';
import { useConcept } from '../hooks/useConcept';
import { useQueueEntries } from '../hooks/useQueueEntries';
import type { Concept, QueueEntry } from '../types';
import AttendingPatients from './attending-patients.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseQueueEntries = vi.mocked(useQueueEntries);
const mockUseConcept = vi.mocked(useConcept);

vi.mock('../hooks/useQueueEntries', () => ({
  useQueueEntries: vi.fn(),
  useMutateQueueEntries: () => ({ mutateQueueEntries: vi.fn() }),
}));

vi.mock('../hooks/useConcept', () => ({
  useConcept: vi.fn(),
}));

const queueEntry = {
  uuid: 'qe-1',
  patient: {
    uuid: 'patient-1',
    person: { display: 'John Doe', gender: 'M', birthdate: '1990-01-15T00:00:00.000+0000' },
  },
  priority: { uuid: 'priority-1', display: 'Urgent' },
  priorityComment: null,
  queue: { display: 'Outpatient Triage' },
} as unknown as QueueEntry;

function mockEntries(entries: Array<QueueEntry>, overrides: Partial<ReturnType<typeof useQueueEntries>> = {}) {
  mockUseQueueEntries.mockReturnValue({
    queueEntries: entries,
    isLoading: false,
    error: undefined,
    totalCount: entries.length,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useQueueEntries>);
}

function buildEntries(count: number) {
  return Array.from(
    { length: count },
    (_, index) =>
      ({
        ...queueEntry,
        uuid: `qe-${index}`,
        patient: { ...queueEntry.patient, uuid: `patient-${index}`, person: { display: `Patient ${index}` } },
      }) as unknown as QueueEntry,
  );
}

describe('AttendingPatients', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema<ConfigObject>(configSchema),
      customPatientChartUrl: 'someUrl',
    });
    mockUseConcept.mockReturnValue({ concept: undefined, error: undefined, isLoading: true });
  });

  it('titles the section with the configured in-service status, as the metrics tile does', () => {
    mockEntries([]);
    const { concepts } = getDefaultsFromConfigSchema<ConfigObject>(configSchema);
    mockUseConcept.mockReturnValue({
      concept: { uuid: concepts.defaultTransitionStatus, display: 'Being seen' } as Concept,
      error: undefined,
      isLoading: false,
    });

    render(<AttendingPatients />);

    expect(mockUseConcept).toHaveBeenCalledWith(concepts.defaultTransitionStatus);
    expect(screen.getByRole('heading', { name: 'Being seen' })).toBeInTheDocument();
  });

  it('renders a card per in-service patient with a translated gender, their age and their queue', () => {
    mockEntries([queueEntry]);
    render(<AttendingPatients />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Sex and age share a line, in that order; the queue replaced the birthdate.
    expect(screen.getByText(/^Male · /)).toBeInTheDocument();
    expect(screen.getByText(/Outpatient Triage/)).toBeInTheDocument();
    expect(screen.queryByText(/1990/)).not.toBeInTheDocument();
  });

  it('says explicitly that no patients are being attended to rather than hiding the section', () => {
    mockEntries([]);
    render(<AttendingPatients />);

    // Falls back to the default label until the status concept has loaded.
    expect(screen.getByRole('heading', { name: 'In Service' })).toBeInTheDocument();
    expect(screen.getByText('No patients are currently being attended to')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('cds--layer-two');
  });

  it('distinguishes a failed request from an empty list', () => {
    mockEntries([], { error: new Error('network'), totalCount: 0 });
    render(<AttendingPatients />);

    expect(screen.getByText('Error State')).toBeInTheDocument();
    expect(screen.queryByText('No patients are currently being attended to')).not.toBeInTheDocument();
  });

  it('caps the cards and reveals the rest behind "View all"', async () => {
    const user = userEvent.setup();
    mockEntries(buildEntries(5));
    render(<AttendingPatients />);

    // Capped to three cards, but the count tag still reports the true total.
    expect(screen.getByText('Patient 2')).toBeInTheDocument();
    expect(screen.queryByText('Patient 3')).not.toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'View all' }));
    expect(screen.getByText('Patient 4')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.queryByText('Patient 3')).not.toBeInTheDocument();
  });

  it('uses the queue when given rather than the selected location and service', () => {
    mockEntries([queueEntry]);
    const { concepts } = getDefaultsFromConfigSchema<ConfigObject>(configSchema);

    render(<AttendingPatients queueUuid="q1" />);

    expect(mockUseQueueEntries).toHaveBeenCalledWith({
      queue: 'q1',
      status: concepts.defaultTransitionStatus,
      isEnded: false,
    });
  });

  it('offers the queue entry actions from a menu in the queue row, which sits outside the patient chart link', async () => {
    const user = userEvent.setup();
    mockEntries([{ ...queueEntry, previousQueueEntry: { uuid: 'qe-0' } } as unknown as QueueEntry]);
    render(<AttendingPatients />);

    const menuButton = screen.getByRole('button', { name: 'Actions menu' });
    const link = screen.getByRole('link');
    expect(link).not.toContainElement(menuButton);
    expect(link).not.toHaveTextContent('Outpatient Triage');

    await user.click(menuButton);
    // Carbon leaves the opened menu `visibility: hidden` under jsdom, so read the items' text directly.
    const items = screen.getAllByRole('menuitem', { hidden: true });
    expect(items.map((item) => item.textContent)).toEqual(['Move', 'Edit', 'Remove patient', 'Undo transition']);

    // Arrow keys move between the items, and wrap from the last one back to the first.
    const [move, edit, , undo] = items;
    move.focus();
    await user.keyboard('{ArrowDown}');
    expect(edit).toHaveFocus();
    undo.focus();
    await user.keyboard('{ArrowDown}');
    expect(move).toHaveFocus();
  });

  it('does not offer "View all" when everything already fits', () => {
    mockEntries(buildEntries(3));
    render(<AttendingPatients />);

    expect(screen.queryByRole('button', { name: 'View all' })).not.toBeInTheDocument();
  });
});
