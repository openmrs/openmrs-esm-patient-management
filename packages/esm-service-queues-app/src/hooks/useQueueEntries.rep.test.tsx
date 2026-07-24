import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { renderWithSwr } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import { type QueueEntry } from '../types';
import CallQueueEntryModal from '../modals/call-modal/call-queue-entry.modal';
import UndoTransitionQueueEntryModal from '../modals/undo-transition-queue-entry.modal';
import QueueTable from '../queue-table/queue-table.component';

// `identifierTypeUuid` default of `defaultColumnConfig`, so the built-in patient-identifier column renders this identifier.
const openmrsIdTypeUuid = '05a29f94-c0ed-11e2-94be-8c13b969e334';
const visitQueueNumberAttributeUuid = 'queue-number-visit-attr-type-uuid';

// Shaped exactly like the custom representation fetched by useQueueEntries: no fields beyond what it requests.
// Rendering it through the columns and row actions fails if a future trim drops a field something still reads.
const repShapedQueueEntry = {
  uuid: 'queue-entry-uuid',
  display: 'Alice Johnson',
  queue: { uuid: 'current-queue-uuid', display: 'General Surgery', name: 'General Surgery' },
  status: { uuid: 'in-service-status-uuid', display: 'In Service' },
  patient: {
    uuid: 'patient-uuid',
    display: 'Alice Johnson',
    person: {
      uuid: 'person-uuid',
      display: 'Alice Johnson',
      age: 40,
      birthdate: '1986-01-01T00:00:00.000+0000',
      gender: 'F',
    },
    identifiers: [
      {
        uuid: 'identifier-uuid',
        identifier: '100GEJ',
        identifierType: { uuid: openmrsIdTypeUuid, display: 'OpenMRS ID' },
      },
    ],
  },
  visit: {
    uuid: 'visit-uuid',
    startDatetime: '2024-01-02T00:00:00.000+0000',
    attributes: [{ uuid: 'visit-attribute-uuid', value: '42', attributeType: { uuid: visitQueueNumberAttributeUuid } }],
  },
  priority: { uuid: 'urgent-priority-uuid', display: 'Urgent' },
  priorityComment: null,
  sortWeight: 0,
  startedAt: '2024-01-02T00:00:00.000+0000',
  endedAt: null,
  queueComingFrom: { uuid: 'coming-from-queue-uuid', display: 'Triage' },
  previousQueueEntry: {
    uuid: 'previous-queue-entry-uuid',
    startedAt: '2024-01-01T00:00:00.000+0000',
    status: { uuid: 'waiting-status-uuid', display: 'Waiting' },
  },
} as unknown as QueueEntry;

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const configDefaults = getDefaultsFromConfigSchema<ConfigObject>(configSchema);

vi.mock('../service-queues.resource', async () => ({
  ...((await vi.importActual('../service-queues.resource')) as object),
  serveQueueEntry: vi.fn().mockResolvedValue({ status: 200 }),
  updateQueueEntry: vi.fn().mockResolvedValue({ status: 201 }),
}));

vi.mock('../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: vi.fn() }),
}));

vi.mock('../modals/call-modal/call-queue-entry.resource', () => ({
  requeueQueueEntry: vi.fn().mockResolvedValue({ status: 200 }),
}));

vi.mock('../hooks/useQueues', () => ({
  useQueues: vi.fn().mockReturnValue({ queues: [] }),
}));

describe('Queue entry custom representation contract', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession.data);
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      customPatientChartUrl: 'someUrl',
      visitQueueNumberAttributeUuid,
      defaultIdentifierTypes: [openmrsIdTypeUuid],
      concepts: { ...configDefaults.concepts, defaultTransitionStatus: 'some-default-transition-status' },
    } as ConfigObject);
  });

  it('supplies every field read by the configured columns', () => {
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      customPatientChartUrl: 'someUrl',
      visitQueueNumberAttributeUuid,
      queueTables: {
        ...configDefaults.queueTables,
        tableDefinitions: [
          {
            columns: [
              'patient-name',
              'patient-identifier',
              'patient-age',
              'coming-from',
              'priority',
              'status',
              'queue',
              'queue-number',
              'visit-start-time',
              'wait-time',
              'actions',
            ],
            appliedTo: [{ queue: '', status: '' }],
          },
        ],
      },
    } as ConfigObject);

    renderWithSwr(<QueueTable queueEntries={[repShapedQueueEntry]} queueUuid={null} statusUuid={null} />);

    expect(screen.getByRole('link', { name: 'Alice Johnson' })).toBeInTheDocument();
    expect(screen.getByText('100GEJ')).toBeInTheDocument();
    expect(screen.getByText('Triage')).toBeInTheDocument();
    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('In Service')).toBeInTheDocument();
    expect(screen.getByText('General Surgery')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    // patient-age, visit-start-time and wait-time render "NaN"/"Invalid Date" if birthdate or a datetime is dropped.
    expect(screen.queryByText(/NaN|Invalid Date/i)).not.toBeInTheDocument();
  });

  it('supplies every field read by the Call action modal', () => {
    renderWithSwr(<CallQueueEntryModal queueEntry={repShapedQueueEntry} closeModal={vi.fn()} />);

    expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument();
    expect(screen.getByText(/OpenMRS ID/)).toBeInTheDocument();
    expect(screen.getAllByText('100GEJ').length).toBeGreaterThan(0);
    expect(screen.getByText(/Gender:\s*F/)).toBeInTheDocument();
    expect(screen.getByText(/Age:\s*40/)).toBeInTheDocument();
  });

  it('supplies every field read by the Undo action modal', () => {
    renderWithSwr(<UndoTransitionQueueEntryModal queueEntry={repShapedQueueEntry} closeModal={vi.fn()} />);

    expect(screen.getByText(/move patient back to queue "Triage" with status "Waiting"/)).toBeInTheDocument();
    expect(screen.getByText(/Undo transition for Alice Johnson/)).toBeInTheDocument();
  });
});
