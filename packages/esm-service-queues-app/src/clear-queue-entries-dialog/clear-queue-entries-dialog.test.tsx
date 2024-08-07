import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { batchClearQueueEntries } from './clear-queue-entries-dialog.resource';
import ClearQueueEntriesDialog from './clear-queue-entries-dialog.component';

const mockBatchClearQueueEntries = jest.mocked(batchClearQueueEntries);
const mockCloseModal = jest.fn();

const defaultProps = {
  queueEntries: [],
  closeModal: mockCloseModal,
};

jest.mock('./clear-queue-entries-dialog.resource');
jest.mock('../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: jest.fn() }),
}));

describe('ClearQueueEntriesDialog Component', () => {
  it('renders the component with warning message', () => {
    renderClearQueueEntriesDialog();

    expect(screen.getByRole('heading', { name: 'Service queue' })).toBeInTheDocument();
    expect(screen.getByText('Clear all queue entries?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Clear queue')).toBeInTheDocument();
  });

  it('should close modal when the cancel button is clicked', async () => {
    const user = userEvent.setup();

    mockBatchClearQueueEntries.mockResolvedValue(undefined);
    renderClearQueueEntriesDialog();

    await user.click(screen.getByText('Cancel'));
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});

function renderClearQueueEntriesDialog(props = {}) {
  render(<ClearQueueEntriesDialog {...defaultProps} {...props} />);
}
