import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ClearQueueEntriesDialog from './clear-queue-entries-dialog.component';
import { batchClearQueueEntries } from './clear-queue-entries-dialog.resource';

const mockBatchClearQueueEntries = batchClearQueueEntries as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  showToast: jest.fn(),
}));

jest.mock('./clear-queue-entries-dialog.resource');

jest.mock('../active-visits/active-visits-table.resource', () => ({
  useVisitQueueEntries: () => ({
    mutate: jest.fn(),
  }),
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
    const closeModalMock = jest.fn();
    mockBatchClearQueueEntries.mockImplementationOnce(() => Promise.resolve());
    render(<ClearQueueEntriesDialog visitQueueEntries={visitQueueEntriesMock} closeModal={closeModalMock} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(closeModalMock).toHaveBeenCalled();
  });
});
