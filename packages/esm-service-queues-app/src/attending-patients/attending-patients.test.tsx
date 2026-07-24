import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

function mockEntries(entries: Array<QueueEntry>) {
  mockUseQueueEntries.mockReturnValue({
    queueEntries: entries,
    isLoading: false,
    error: undefined,
    totalCount: entries.length,
    isValidating: false,
    mutate: vi.fn(),
  } as ReturnType<typeof useQueueEntries>);
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

  it('renders nothing when there are no attending patients', () => {
    mockEntries([]);
    const { container } = render(<AttendingPatients />);
    expect(container).toBeEmptyDOMElement();
  });
});
