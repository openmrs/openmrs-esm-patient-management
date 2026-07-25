import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../config-schema';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { type QueueEntry } from '../types';
import AttendingPatients from './attending-patients.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseQueueEntries = vi.mocked(useQueueEntries);

vi.mock('../hooks/useQueueEntries', () => ({
  useQueueEntries: vi.fn(),
}));

const queueEntry = {
  uuid: 'qe-1',
  patient: {
    uuid: 'patient-1',
    person: { display: 'John Doe', gender: 'M', birthdate: '1990-01-15T00:00:00.000+0000' },
  },
  priority: { uuid: 'priority-1', display: 'Urgent' },
  priorityComment: null,
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
  });

  it('renders a card per in-service patient with a translated gender and localized birthdate', () => {
    mockEntries([queueEntry]);
    render(<AttendingPatients />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Male/)).toBeInTheDocument();
    // Locale-aware date (not the old hardcoded DD-MM-YYYY); year must appear.
    expect(screen.getByText(/1990/)).toBeInTheDocument();
    expect(screen.queryByText('15-01-1990')).not.toBeInTheDocument();
  });

  it('says explicitly that no one is being attended rather than hiding the section', () => {
    mockEntries([]);
    render(<AttendingPatients />);

    expect(screen.getByText('Attending')).toBeInTheDocument();
    expect(screen.getByText('No one is being attended')).toBeInTheDocument();
  });

  it('distinguishes a failed request from an empty list', () => {
    mockEntries([], { error: new Error('network'), totalCount: 0 });
    render(<AttendingPatients />);

    expect(screen.getByText('Error State')).toBeInTheDocument();
    expect(screen.queryByText('No one is being attended')).not.toBeInTheDocument();
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

  it('does not offer "View all" when everything already fits', () => {
    mockEntries(buildEntries(3));
    render(<AttendingPatients />);

    expect(screen.queryByRole('button', { name: 'View all' })).not.toBeInTheDocument();
  });
});
