import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { batchClearQueueEntries } from './clear-queue-entries.resource';
import ClearQueueEntriesModal from './clear-queue-entries.modal';

const mockBatchClearQueueEntries = vi.mocked(batchClearQueueEntries);
const mockCloseModal = vi.fn();

const defaultProps = {
  queueEntries: [],
  closeModal: mockCloseModal,
};

vi.mock('./clear-queue-entries.resource', () => ({
  batchClearQueueEntries: vi.fn(),
}));

vi.mock('../../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: vi.fn() }),
}));

describe('ClearQueueEntriesModal Component', () => {
  it('renders the component with warning message', () => {
    renderClearQueueEntriesModal();

    expect(screen.getByRole('heading', { name: 'Service queues' })).toBeInTheDocument();
    expect(screen.getByText('Clear all queue entries?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Clear queue entries')).toBeInTheDocument();
  });

  it('should close modal when the cancel button is clicked', async () => {
    const user = userEvent.setup();

    mockBatchClearQueueEntries.mockResolvedValue(undefined);
    renderClearQueueEntriesModal();

    await user.click(screen.getByText('Cancel'));
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

function renderClearQueueEntriesModal(props = {}) {
  render(<ClearQueueEntriesModal {...defaultProps} {...props} />);
}
