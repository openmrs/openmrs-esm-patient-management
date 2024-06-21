import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { batchClearQueueEntries } from './clear-queue-entries-dialog.resource';
import ClearQueueEntriesDialog from './clear-queue-entries-dialog.component';

const mockBatchClearQueueEntries = batchClearQueueEntries as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  showSnackbar: jest.fn(),
}));

jest.mock('./clear-queue-entries-dialog.resource');

jest.mock('../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({ mutateQueueEntries: jest.fn() }),
}));

describe('ClearQueueEntriesDialog Component', () => {
  const visitQueueEntriesMock = [];

  it('renders the component with warning message', () => {
    render(<ClearQueueEntriesDialog visitQueueEntries={visitQueueEntriesMock} closeModal={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Service queue' })).toBeInTheDocument();
    expect(screen.getByText('Clear all queue entries?')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Clear queue')).toBeInTheDocument();
  });

  it('should close modal when clicked on cancel', async () => {
    const user = userEvent.setup();
    const closeModalMock = jest.fn();

    mockBatchClearQueueEntries.mockImplementationOnce(() => Promise.resolve());
    render(<ClearQueueEntriesDialog visitQueueEntries={visitQueueEntriesMock} closeModal={closeModalMock} />);

    await user.click(screen.getByText('Cancel'));

    expect(closeModalMock).toHaveBeenCalled();
  });
});
