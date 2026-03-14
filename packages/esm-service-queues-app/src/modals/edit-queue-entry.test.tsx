import React from 'react';
import { screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockQueueEntryAlice, mockQueues } from '__mocks__';
import { renderWithSwr } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import EditQueueEntryModal from './edit-queue-entry.modal';

const mockMutateQueueEntries = jest.fn();
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('../hooks/useQueues', () => ({
  useQueues: jest.fn().mockReturnValue({ queues: mockQueues }),
}));

jest.mock('../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({
    mutateQueueEntries: mockMutateQueueEntries,
  }),
}));

const mockUseQueueEntry = jest.fn();
jest.mock('../hooks/useQueueEntry', () => ({
  useQueueEntry: (...args: unknown[]) => mockUseQueueEntry(...args),
}));

describe('EditQueueEntryModal', () => {
  const closeModal = jest.fn();

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

    renderWithSwr(<EditQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByTestId('edit-queue-entry-loading-skeleton')).toBeInTheDocument();
  });

  it('shows an error notification when fetching the queue entry fails', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: null,
      error: { message: 'Network error' },
      isLoading: false,
    });

    renderWithSwr(<EditQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText('Error loading queue entry')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows a warning and refreshes the queue when the entry has already ended', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: { ...mockQueueEntryAlice, endedAt: '2024-01-03T00:00:00.000+0000' },
      error: null,
      isLoading: false,
    });

    renderWithSwr(<EditQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText('Queue entry is no longer active')).toBeInTheDocument();
    expect(mockMutateQueueEntries).toHaveBeenCalled();
  });

  it('shows a warning when the queue entry is not found', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: null,
      error: null,
      isLoading: false,
    });

    renderWithSwr(<EditQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByText('Queue entry is no longer active')).toBeInTheDocument();
    expect(mockMutateQueueEntries).toHaveBeenCalled();
  });

  it('renders the action modal when the queue entry is active', () => {
    mockUseQueueEntry.mockReturnValue({
      queueEntry: mockQueueEntryAlice,
      error: null,
      isLoading: false,
    });

    renderWithSwr(<EditQueueEntryModal queueEntry={mockQueueEntryAlice} closeModal={closeModal} />);

    expect(screen.getByRole('button', { name: 'Edit queue entry' })).toBeInTheDocument();
    expect(screen.queryByText('Queue entry is no longer active')).not.toBeInTheDocument();
  });
});
