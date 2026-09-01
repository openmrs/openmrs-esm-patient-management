import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  useConfig,
  useLayoutType,
  useSession,
  type Visit,
} from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../../config-schema';
import { mockSession, mockVisitAlice } from '__mocks__';
import { postQueueEntry } from './queue-fields.resource';
import { useQueues } from '../../hooks/useQueues';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import QueueFields from './queue-fields.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseLayoutType = vi.mocked(useLayoutType);
const mockUseSession = vi.mocked(useSession);

const service1Uuid = 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90';
const service2Uuid = 'f3b8a1d2-6c47-4e19-9c2f-8d1a5b7e4c30';

const mockQueues = [
  {
    uuid: service1Uuid,
    name: 'Service 1',
    location: { uuid: '1' },
    allowedPriorities: [{ uuid: '197852c7-5fd4-4b33-89cc-7bae6848c65a', display: 'High' }],
    allowedStatuses: [{ uuid: '176052c7-5fd4-4b33-89cc-7bae6848c65a', display: 'In Progress' }],
  },
  { uuid: service2Uuid, name: 'Service 2', location: { uuid: '1' } },
];

vi.mock('../hooks/useQueueLocations', () => ({
  useQueueLocations: vi.fn(() => ({ queueLocations: [{ id: '1', name: 'Location 1' }] })),
}));

vi.mock('../../hooks/useQueues', () => ({
  useQueues: vi.fn(),
}));

vi.mock('../../hooks/useQueueEntries', () => ({
  useQueueEntries: vi.fn(),
  useMutateQueueEntries: vi.fn(() => ({ mutateQueueEntries: vi.fn() })),
}));

vi.mock('./queue-fields.resource', () => {
  return { postQueueEntry: vi.fn() };
});

const mockUseQueues = vi.mocked(useQueues);
const mockUseQueueEntries = vi.mocked(useQueueEntries);
const mockPostQueueEntry = vi.mocked(postQueueEntry).mockResolvedValue({} as FetchResponse);

describe('QueueFields', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockUseSession.mockReturnValue(mockSession.data);
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema) });
    mockUseQueues.mockReturnValue({ queues: mockQueues } as any);
    mockUseQueueEntries.mockReturnValue({ queueEntries: [] } as any);
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
    await user.selectOptions(serviceSelect, service1Uuid);

    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    await onSubmit(mockVisitAlice);
    expect(mockPostQueueEntry).toHaveBeenCalledWith(
      mockVisitAlice.uuid,
      service1Uuid,
      mockVisitAlice.patient.uuid,
      '197852c7-5fd4-4b33-89cc-7bae6848c65a',
      '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
      0,
      '1',
      'c0c579b0-8e59-401d-8a4a-976a0b183519',
    );
  });

  it('omits services the patient is already queued in', async () => {
    const user = userEvent.setup();
    mockUseQueueEntries.mockReturnValue({ queueEntries: [{ queue: { uuid: service1Uuid } }] } as any);

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={vi.fn()} />);

    await user.selectOptions(screen.getByTitle(/select a queue location/i), '1');

    expect(screen.getByRole('option', { name: 'Service 2' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Service 1' })).not.toBeInTheDocument();
  });

  it('omits a queue location once the patient is queued in all of its services', () => {
    mockUseQueueEntries.mockReturnValue({
      queueEntries: [{ queue: { uuid: service1Uuid } }, { queue: { uuid: service2Uuid } }],
    } as any);

    render(<QueueFields patientUuid={mockVisitAlice.patient.uuid} setOnSubmit={vi.fn()} />);

    expect(screen.queryByRole('option', { name: 'Location 1' })).not.toBeInTheDocument();
    expect(screen.getByText(/already in every queue at the available locations/i)).toBeInTheDocument();
  });

  it('does not look up queue entries when there is no patient to look them up for', () => {
    render(<QueueFields patientUuid={undefined} setOnSubmit={vi.fn()} />);

    expect(mockUseQueueEntries).toHaveBeenCalledWith(expect.anything(), expect.anything(), false);
    expect(screen.getByRole('option', { name: 'Location 1' })).toBeInTheDocument();
  });
});
