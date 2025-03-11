import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { batchClearQueueEntries } from './clear-queue-entries.resource';
import ClearQueueEntriesModal from './clear-queue-entries.modal';

const mockBatchClearQueueEntries = jest.mocked(batchClearQueueEntries);
const mockCloseModal = jest.fn();

const defaultProps = {
  queueEntries: [],
  closeModal: mockCloseModal,
};

jest.mock('./clear-queue-entries.resource', () => ({
  batchClearQueueEntries: jest.fn(),
}));

jest.mock('../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: jest.fn() }),
}));

describe('ClearQueueEntriesModal Component', () => {
  it('renders the component with warning message', () => {
    renderClearQueueEntriesModal();

    expect(screen.getByRole('heading', { name: 'Service queue' })).toBeInTheDocument();
    expect(screen.getByText('Clear all queue entries?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Clear queue')).toBeInTheDocument();
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
