import React from 'react';
import { render, screen } from '@testing-library/react';
import { useActiveTickets } from './useActiveTickets';
import QueueScreen from './queue-screen.component';

jest.mock('./useActiveTickets');

describe('QueueScreen component', () => {
  test('renders loading skeleton when data is loading', () => {
    const mockedUseActiveTickets = useActiveTickets as jest.MockedFunction<typeof useActiveTickets>;
    mockedUseActiveTickets.mockReturnValue({ isLoading: true, activeTickets: [], error: undefined, mutate: jest.fn() });
    render(<QueueScreen />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('renders error message when there is an error fetching data', () => {
    const mockedUseActiveTickets = useActiveTickets as jest.MockedFunction<typeof useActiveTickets>;
    mockedUseActiveTickets.mockReturnValue({
      error: new Error('Error'),
      isLoading: false,
      activeTickets: [],
      mutate: jest.fn(),
    });
    render(<QueueScreen />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  test('renders table with active tickets when data is loaded', () => {
    const mockedUseActiveTickets = useActiveTickets as jest.MockedFunction<typeof useActiveTickets>;
    mockedUseActiveTickets.mockReturnValue({
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
