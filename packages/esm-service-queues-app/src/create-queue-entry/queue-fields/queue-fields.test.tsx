import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  showSnackbar,
  useConfig,
  useLayoutType,
  useSession,
  type Visit,
} from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../../config-schema';
import {
  mockPriorityNonUrgent,
  mockQueues,
  mockQueueSurgery,
  mockQueueTriage,
  mockSession,
  mockVisitAlice,
} from '__mocks__';
import { postQueueEntry } from './queue-fields.resource';
import { useQueues } from '../../hooks/useQueues';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import { useServiceQueuesStore } from '../../store/store';
import QueueFields from './queue-fields.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockUseSession = vi.mocked(useSession);

vi.mock('../hooks/useQueueLocations', () => ({
  useQueueLocations: vi.fn(() => ({ queueLocations: [{ id: '1', name: 'Location 1' }] })),
}));

vi.mock('../../hooks/useQueues', () => ({
  useQueues: vi.fn(),
}));

const mockMutateQueueEntries = vi.fn();

vi.mock('../../hooks/useQueueEntries', () => ({
  useQueueEntries: vi.fn(),
  useMutateQueueEntries: () => ({ mutateQueueEntries: mockMutateQueueEntries }),
}));

vi.mock('../../store/store', () => ({
  useServiceQueuesStore: vi.fn(),
}));

vi.mock('./queue-fields.resource', () => {
  return { postQueueEntry: vi.fn() };
});

const mockUseQueues = vi.mocked(useQueues);
const mockUseServiceQueuesStore = vi.mocked(useServiceQueuesStore);
const mockUseQueueEntries = vi.mocked(useQueueEntries);
const mockPostQueueEntry = vi.mocked(postQueueEntry).mockResolvedValue({} as FetchResponse);

describe('QueueFields', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockUseSession.mockReturnValue(mockSession.data);
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema) });
    mockUseQueues.mockReturnValue({ queues: mockQueues } as any);
    mockUseQueueEntries.mockReturnValue({ queueEntries: [] } as any);
    mockUseServiceQueuesStore.mockReturnValue({} as any);
  });

  it('renders the form fields and returns the set values', async () => {
    const user = userEvent.setup();
    let onSubmit: (visit: Visit) => Promise<any> = null;
    const setOnSubmit = (callback) => {
      onSubmit = callback;
    };

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={setOnSubmit} />);

    expect(screen.getByRole('group', { name: /queue location/i })).toBeInTheDocument();

    const locationSelect = screen.getByTitle(/select a queue location/i);
    await user.selectOptions(locationSelect, '1');

    expect(screen.getByRole('group', { name: /service/i })).toBeInTheDocument();

    const serviceSelect = screen.getByTitle(/select a queue service/i);
    await user.selectOptions(serviceSelect, mockQueueTriage.uuid);

    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText(mockPriorityNonUrgent.display)).toBeInTheDocument();

    await onSubmit(mockVisitAlice);
    expect(mockPostQueueEntry).toHaveBeenCalledWith(
      mockVisitAlice.uuid,
      mockQueueTriage.uuid,
      mockVisitAlice.patient.uuid,
      mockPriorityNonUrgent.uuid,
      '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
      0,
      '1',
      'c0c579b0-8e59-401d-8a4a-976a0b183519',
    );
  });

  it('omits services the patient is already queued in', async () => {
    const user = userEvent.setup();
    mockUseQueueEntries.mockReturnValue({ queueEntries: [{ queue: { uuid: mockQueueTriage.uuid } }] } as any);

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={vi.fn()} />);

    await user.selectOptions(screen.getByTitle(/select a queue location/i), '1');

    expect(screen.getByRole('option', { name: mockQueueSurgery.name })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: mockQueueTriage.name })).not.toBeInTheDocument();
  });

  it('says so when the patient is already queued in every service at the location', async () => {
    const user = userEvent.setup();
    mockUseQueueEntries.mockReturnValue({
      queueEntries: [{ queue: { uuid: mockQueueTriage.uuid } }, { queue: { uuid: mockQueueSurgery.uuid } }],
    } as any);

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={vi.fn()} />);

    await user.selectOptions(screen.getByTitle(/select a queue location/i), '1');

    expect(screen.getByRole('option', { name: 'Location 1' })).toBeInTheDocument();
    expect(screen.getByText(/already in every queue at this location/i)).toBeInTheDocument();
    expect(screen.queryByText(/no services configured/i)).not.toBeInTheDocument();
  });

  it('warns when the active queue entry lookup fails and offers every service', async () => {
    const user = userEvent.setup();
    mockUseQueueEntries.mockReturnValue({ queueEntries: [], isLoading: false, error: new Error('boom') } as any);

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={vi.fn()} />);

    await user.selectOptions(screen.getByTitle(/select a queue location/i), '1');

    expect(screen.getByRole('option', { name: mockQueueTriage.name })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: mockQueueSurgery.name })).toBeInTheDocument();
    expect(screen.getByText(/cannot check the patient’s current queues/i)).toBeInTheDocument();
  });

  it('reports a location with no services configured as a misconfiguration', async () => {
    const user = userEvent.setup();
    mockUseQueues.mockReturnValue({ queues: [] } as any);

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={vi.fn()} />);

    await user.selectOptions(screen.getByTitle(/select a queue location/i), '1');

    expect(screen.getByText(/no services configured/i)).toBeInTheDocument();
    expect(screen.queryByText(/already in every queue at this location/i)).not.toBeInTheDocument();
  });

  it('does not submit a service prefilled from the dashboard until the entries have loaded', async () => {
    mockUseServiceQueuesStore.mockReturnValue({ selectedServiceUuid: mockQueueTriage.uuid } as any);
    mockUseQueueEntries.mockReturnValue({ queueEntries: [], isLoading: true } as any);
    let onSubmit: (visit: Visit) => Promise<any>;

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={(cb) => (onSubmit = cb)} />);

    await expect(onSubmit(mockVisitAlice)).rejects.toThrow(/validation/i);
    expect(mockPostQueueEntry).not.toHaveBeenCalled();
  });

  it('clears a prefilled service once the entries show the patient is already in it', async () => {
    const user = userEvent.setup();
    mockUseServiceQueuesStore.mockReturnValue({ selectedServiceUuid: mockQueueTriage.uuid } as any);
    mockUseQueueEntries.mockReturnValue({ queueEntries: [], isLoading: true } as any);
    let onSubmit: (visit: Visit) => Promise<any>;

    const { rerender } = render(
      <QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={(cb) => (onSubmit = cb)} />,
    );
    await user.selectOptions(screen.getByTitle(/select a queue location/i), '1');

    mockUseQueueEntries.mockReturnValue({
      queueEntries: [{ queue: { uuid: mockQueueTriage.uuid } }],
      isLoading: false,
    } as any);
    // A new setOnSubmit reference gets past React.memo so the updated mock is read
    rerender(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={(cb) => (onSubmit = cb)} />);

    expect(screen.getByTitle(/select a queue service/i)).toHaveValue('');
    expect(screen.queryByRole('option', { name: mockQueueTriage.name })).not.toBeInTheDocument();
    await expect(onSubmit(mockVisitAlice)).rejects.toThrow(/validation/i);
    expect(mockPostQueueEntry).not.toHaveBeenCalled();
  });

  it('warns and refreshes the entries when the backend rejects a duplicate queue entry', async () => {
    const user = userEvent.setup();
    const duplicateError = {
      responseBody: {
        error: {
          message: 'Invalid Submission',
          globalErrors: [{ code: 'queue.entry.error.duplicate', message: 'This patient is already in this queue' }],
        },
      },
    };
    mockPostQueueEntry.mockRejectedValueOnce(duplicateError);
    let onSubmit: (visit: Visit) => Promise<any>;

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={(cb) => (onSubmit = cb)} />);

    await user.selectOptions(screen.getByTitle(/select a queue location/i), '1');
    await user.selectOptions(screen.getByTitle(/select a queue service/i), mockQueueTriage.uuid);

    await expect(onSubmit(mockVisitAlice)).rejects.toBe(duplicateError);
    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'warning', title: 'Patient already in queue' }),
    );
    expect(mockMutateQueueEntries).toHaveBeenCalledTimes(1);
  });

  it('does not look up queue entries when there is no patient to look them up for', () => {
    render(<QueueFields patientUuid={undefined} setOnSubmit={vi.fn()} />);

    expect(mockUseQueueEntries).toHaveBeenCalledWith(expect.anything(), expect.anything(), false);
    expect(screen.getByRole('option', { name: 'Location 1' })).toBeInTheDocument();
  });
});
