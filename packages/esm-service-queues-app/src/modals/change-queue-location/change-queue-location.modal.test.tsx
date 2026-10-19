import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQueueLocations } from '../../create-queue-entry/hooks/useQueueLocations';
import { useQueues } from '../../hooks/useQueues';
import ChangeQueueLocationModal from './change-queue-location.modal';

const mockUseQueueLocations = vi.mocked(useQueueLocations);
const mockUseQueues = vi.mocked(useQueues);
const mockCloseModal = vi.fn();

vi.mock('../../create-queue-entry/hooks/useQueueLocations', () => ({
  useQueueLocations: vi.fn(),
}));

vi.mock('../../hooks/useQueues', () => ({
  useQueues: vi.fn(),
}));

describe('ChangeQueueLocationModal', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockUseQueueLocations.mockReturnValue({
      queueLocations: [{ id: 'loc-1', name: 'Triage' }],
      isLoading: false,
      error: null,
    } as ReturnType<typeof useQueueLocations>);
    mockUseQueues.mockReturnValue({
      queues: [],
      isLoading: false,
      error: undefined,
    } as ReturnType<typeof useQueues>);
  });

  it('renders the location and service dropdowns', () => {
    render(<ChangeQueueLocationModal closeModal={mockCloseModal} />);
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
  });

  it('applies the selection to the store and closes on submit', async () => {
    const user = userEvent.setup();
    render(<ChangeQueueLocationModal closeModal={mockCloseModal} />);

    await user.click(screen.getByRole('button', { name: 'Change' }));

    // Default is "All" for both, which clears the persisted selection.
    expect(sessionStorage.getItem('queueLocationUuid')).toBeNull();
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('surfaces a locations load failure', () => {
    mockUseQueueLocations.mockReturnValue({
      queueLocations: [],
      isLoading: false,
      error: new Error('locations down'),
    } as ReturnType<typeof useQueueLocations>);

    render(<ChangeQueueLocationModal closeModal={mockCloseModal} />);
    expect(screen.getByText('Failed to load locations')).toBeInTheDocument();
  });

  it('surfaces a services load failure without blocking location selection', () => {
    mockUseQueues.mockReturnValue({
      queues: [],
      isLoading: false,
      error: new Error('queues down'),
    } as ReturnType<typeof useQueues>);

    render(<ChangeQueueLocationModal closeModal={mockCloseModal} />);
    expect(screen.getByText('Failed to load services')).toBeInTheDocument();
    // Location dropdown still renders.
    expect(screen.getByText('Location')).toBeInTheDocument();
  });
});
