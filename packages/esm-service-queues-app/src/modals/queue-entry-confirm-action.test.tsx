import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { type FetchResponse, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { mockQueues, mockQueueEntryAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import DeleteQueueEntryModal from './delete-queue-entry.modal';
import RemoveQueueEntryModal from './remove-queue-entry.modal';
import UndoTransitionQueueEntryModal from './undo-transition-queue-entry.modal';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockMutateQueueEntries = jest.fn();

jest.mock('../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({
      queues: mockQueues,
    }),
  };
});

jest.mock('../hooks/useQueueEntries', () => ({
  useMutateQueueEntries: () => ({
    mutateQueueEntries: mockMutateQueueEntries,
  }),
}));

describe('UndoTransitionQueueEntryModal', () => {
  const queueEntry = mockQueueEntryAlice;

  it('has a cancel button that closes the modal', async () => {
    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<UndoTransitionQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has an working submit button', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      status: 200,
    } as unknown as FetchResponse);

    const user = userEvent.setup();

    renderWithSwr(<UndoTransitionQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /undo transition/i });
    expect(submitButton).toBeEnabled();

    await user.click(submitButton);
    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      subtitle: 'Queue entry transition undo success',
      title: 'Undo transition success',
    });
  });
});

describe('VoidQueueEntryModal', () => {
  const queueEntry = mockQueueEntryAlice;

  it('has a cancel button that closes the modal', async () => {
    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<DeleteQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has an working submit button', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      status: 200,
    } as unknown as FetchResponse);

    const user = userEvent.setup();
    renderWithSwr(<DeleteQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Delete queue entry/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      subtitle: 'Queue entry deleted successfully',
      title: 'Queue entry deleted successfully',
    });
  });
});

describe('EndQueueEntryModal', () => {
  const queueEntry = mockQueueEntryAlice;

  it('has a cancel button that closes the modal', async () => {
    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<RemoveQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has an working submit button', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      status: 200,
    } as unknown as FetchResponse);

    const user = userEvent.setup();

    renderWithSwr(<RemoveQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Remove/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      subtitle: 'Patient removed from queue successfully',
      title: 'Patient removed',
    });
  });

  it('closes modal and shows warning when queue entry has already ended', async () => {
    mockOpenmrsFetch.mockRejectedValue({
      responseBody: {
        error: {
          message: 'Cannot transition a queue entry that has already ended',
        },
      },
    });

    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<RemoveQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);

    const submitButton = screen.getByRole('button', { name: /Remove/ });
    await user.click(submitButton);

    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'warning',
        title: 'Queue entry is no longer active',
      }),
    );
    expect(mockMutateQueueEntries).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
  });
});
