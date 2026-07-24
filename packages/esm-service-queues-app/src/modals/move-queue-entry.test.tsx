import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockPriorityNonUrgent, mockQueueEntryAlice, mockQueues, mockStatusWaiting } from '__mocks__';
import { renderWithSwr } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import MoveQueueEntryModal from './move-queue-entry.modal';

const mockMutateQueueEntries = vi.fn();
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

const mockTransitionQueueEntry = vi.fn();
vi.mock('./queue-entry-actions.resource', () => ({
  transitionQueueEntry: (...args: unknown[]) => mockTransitionQueueEntry(...args),
}));

vi.mock('../hooks/useQueues', () => ({
  useQueues: vi.fn().mockReturnValue({ queues: mockQueues }),
}));

vi.mock('../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({
    mutateQueueEntries: mockMutateQueueEntries,
  }),
}));

const mockUseQueueEntry = vi.fn();
vi.mock('../hooks/useQueueEntry', () => ({
  useQueueEntry: (...args: unknown[]) => mockUseQueueEntry(...args),
}));

describe('MoveQueueEntryModal', () => {
  const closeModal = vi.fn();

  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      priorityConfigs: [
        { conceptUuid: '00000000-0000-0000-0000-000000000001', style: null, color: 'green' },
        { conceptUuid: '00000000-0000-0000-0000-000000000002', style: null, color: 'orange' },
      ],
      concepts: {
        ...getDefaultsFromConfigSchema(configSchema).concepts,
        defaultStatusConceptUuid: '00000000-0000-0000-0000-000000000010',
      },
    } as ConfigObject);
  });

  it('shows a loading skeleton while fetching fresh queue entry data', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: null,
      error: null,
      isLoading: true,
    });

    renderWithSwr(<MoveQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByTestId('move-queue-entry-loading-skeleton')).toBeInTheDocument();
  });

  it('shows an error notification when fetching the queue entry fails', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: null,
      error: { message: 'Network error' },
      isLoading: false,
    });

    renderWithSwr(<MoveQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText('Error loading queue entry')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows a warning and refreshes the queue when the entry has already ended', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: { ...mockQueueEntryAlice, endedAt: '2024-01-03T00:00:00.000+0000' },
      error: null,
      isLoading: false,
    });

    renderWithSwr(<MoveQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText('Queue entry is no longer active')).toBeInTheDocument();
    expect(mockMutateQueueEntries).toHaveBeenCalled();
  });

  it('shows a warning when the queue entry is not found', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: null,
      error: null,
      isLoading: false,
    });

    renderWithSwr(<MoveQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText('Queue entry is no longer active')).toBeInTheDocument();
    expect(mockMutateQueueEntries).toHaveBeenCalled();
  });

  it('renders the action modal when the queue entry is active', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: mockQueueEntryAlice,
      error: null,
      isLoading: false,
    });

    renderWithSwr(<MoveQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByRole('button', { name: 'Move' })).toBeInTheDocument();
    expect(screen.queryByText('Queue entry is no longer active')).not.toBeInTheDocument();
  });

  it('shows both the queue and status pickers so queue and/or status can be changed in one dialog', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: mockQueueEntryAlice,
      error: null,
      isLoading: false,
    });

    renderWithSwr(<MoveQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText('Service location')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('submits the new status when the status is changed', async () => {
    mockTransitionQueueEntry.mockResolvedValue({ status: 200 });
    mockUseQueueEntry.mockReturnValue({
      queueEntry: mockQueueEntryAlice,
      error: null,
      isLoading: false,
    });

    const user = userEvent.setup();
    renderWithSwr(<MoveQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    const submitButton = screen.getByRole('button', { name: 'Move' });
    // Nothing has changed yet, so the action should be disabled.
    expect(submitButton).toBeDisabled();

    await user.click(screen.getByRole('radio', { name: 'Waiting' }));
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);

    expect(mockTransitionQueueEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        queueEntryToTransition: mockQueueEntryAlice.uuid,
        newStatus: mockStatusWaiting.uuid,
      }),
    );
    expect(closeModal).toHaveBeenCalled();
  });

  it('enables the submit action when only the priority changes', async () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: mockQueueEntryAlice,
      error: null,
      isLoading: false,
    });

    const user = userEvent.setup();
    renderWithSwr(<MoveQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    const submitButton = screen.getByRole('button', { name: 'Move' });
    expect(submitButton).toBeDisabled();

    // Alice's current priority is "Urgent"; switching to "Non urgent" is the only change.
    await user.click(screen.getByRole('radio', { name: mockPriorityNonUrgent.display }));

    expect(submitButton).toBeEnabled();
  });
});
