import React from 'react';
import { vi, describe, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useActiveTickets } from './useActiveTickets';
import { updateSelectedQueueLocationName, updateSelectedQueueLocationUuid } from '../store/store';
import QueueScreen from './queue-screen.component';

const mockUseActiveTickets = vi.mocked(useActiveTickets);

vi.mock('./useActiveTickets', () => ({
  useActiveTickets: vi.fn(),
}));

vi.mock('../hooks/useQueues', () => ({
  useQueues: vi.fn(() => ({ queues: [] })),
}));

vi.mock('../create-queue-entry/hooks/useQueueLocations', () => ({
  useQueueLocations: vi.fn(() => ({ queueLocations: [], isLoading: false, error: undefined })),
}));

describe('QueueScreen component', () => {
  beforeEach(() => {
    updateSelectedQueueLocationName('Room A');
    updateSelectedQueueLocationUuid('123');
  });

  test('renders loading skeleton when data is loading', () => {
    mockUseActiveTickets.mockReturnValue({ isLoading: true, activeTickets: [], error: undefined, mutate: vi.fn() });

    render(<QueueScreen />);

    expect(screen.getByTestId('queue-screen-skeleton')).toBeInTheDocument();
  });

  test('renders error message when there is an error fetching data', () => {
    mockUseActiveTickets.mockReturnValue({
      error: new Error('Error'),
      isLoading: false,
      activeTickets: [],
      mutate: vi.fn(),
    });

    render(<QueueScreen />);

    expect(screen.getByText('Error State')).toBeInTheDocument();
  });

  test('renders empty state when there are no active tickets', () => {
    mockUseActiveTickets.mockReturnValue({
      activeTickets: [],
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    render(<QueueScreen />);

    expect(screen.getByText('No active tickets to display')).toBeInTheDocument();
  });

  test('renders table with active tickets when data is loaded', () => {
    mockUseActiveTickets.mockReturnValue({
      activeTickets: [
        {
          room: 'Room A',
          ticketNumber: '123',
          status: 'Pending',
        },
      ],
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
    });

    render(<QueueScreen />);

    expect(screen.getByText('Room : Room A')).toBeInTheDocument();
    expect(screen.getByText('Ticket number')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});
