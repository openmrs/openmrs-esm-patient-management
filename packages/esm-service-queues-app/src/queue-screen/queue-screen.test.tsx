import React from 'react';
import { render, screen } from '@testing-library/react';
import { useActiveTickets } from './useActiveTickets';
import { updateSelectedQueueLocationName, updateSelectedQueueLocationUuid } from '../store/store';
import QueueScreen from './queue-screen.component';

const mockUseActiveTickets = jest.mocked(useActiveTickets);

jest.mock('./useActiveTickets', () => ({
  useActiveTickets: jest.fn(),
}));

jest.mock('../hooks/useQueues', () => ({
  useQueues: jest.fn(() => ({ queues: [] })),
}));

jest.mock('../create-queue-entry/hooks/useQueueLocations', () => ({
  useQueueLocations: jest.fn(() => ({ queueLocations: [], isLoading: false, error: undefined })),
}));

describe('QueueScreen component', () => {
  beforeEach(() => {
    updateSelectedQueueLocationName('Room A');
    updateSelectedQueueLocationUuid('123');
  });

  test('renders loading skeleton when data is loading', () => {
    mockUseActiveTickets.mockReturnValue({ isLoading: true, activeTickets: [], error: undefined, mutate: jest.fn() });

    render(<QueueScreen />);

    expect(screen.getByTestId('queue-screen-skeleton')).toBeInTheDocument();
  });

  test('renders error message when there is an error fetching data', () => {
    mockUseActiveTickets.mockReturnValue({
      error: new Error('Error'),
      isLoading: false,
      activeTickets: [],
      mutate: jest.fn(),
    });

    render(<QueueScreen />);

    expect(screen.getByText('Error State')).toBeInTheDocument();
  });

  test('renders empty state when there are no active tickets', () => {
    mockUseActiveTickets.mockReturnValue({
      activeTickets: [],
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
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
      mutate: jest.fn(),
    });

    render(<QueueScreen />);

    expect(screen.getByText('Room : Room A')).toBeInTheDocument();
    expect(screen.getByText('Ticket number')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });
});
