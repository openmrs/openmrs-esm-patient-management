import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, navigate, useConfig } from '@openmrs/esm-framework';
import { mockQueueEntryAlice } from '__mocks__';
import { configSchema, type ConfigObject } from '../../config-schema';
import { serveQueueEntry, updateQueueEntry } from '../../service-queues.resource';
import { requeueQueueEntry } from './call-queue-entry.resource';
import CallQueueEntryModal from './call-queue-entry.modal';

const mockNavigate = vi.mocked(navigate);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

vi.mock('../../service-queues.resource', async () => ({
  ...((await vi.importActual('../../service-queues.resource')) as object),
  serveQueueEntry: vi.fn().mockResolvedValue({ status: 200 }),
  updateQueueEntry: vi.fn().mockResolvedValue({ status: 201 }),
}));

vi.mock('../../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: vi.fn() }),
}));

vi.mock('./call-queue-entry.resource', () => ({
  requeueQueueEntry: vi.fn().mockResolvedValue({ status: 200 }),
}));

describe('MoveQueueEntryModal', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      concepts: {
        defaultTransitionStatus: 'some-default-transition-status',
      },
      defaultIdentifierTypes: ['05ee9cf4-7242-4a17-b4d4-00f707265c8a', 'f85081e2-b4be-4e48-b3a4-7994b69bb101'],
    } as ConfigObject);
  });

  it('renders modal content', () => {
    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText(/Serve patient/i)).toBeInTheDocument();
    expect(screen.getByText(/Patient name:/i)).toBeInTheDocument();
  });

  it('handles requeueing patient', async () => {
    const user = userEvent.setup();

    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    await user.click(screen.getByText('Requeue'));

    expect(requeueQueueEntry).toHaveBeenCalledWith(
      'Requeued',
      mockQueueEntryAlice.queue.uuid,
      mockQueueEntryAlice.uuid,
    );
  });

  it('handles serving patient', async () => {
    const user = userEvent.setup();

    const closeModal = vi.fn();
    render(<CallQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    await user.click(screen.getByText('Serve'));

    expect(updateQueueEntry).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalled();
    expect(serveQueueEntry).toHaveBeenCalled();
  });
});
