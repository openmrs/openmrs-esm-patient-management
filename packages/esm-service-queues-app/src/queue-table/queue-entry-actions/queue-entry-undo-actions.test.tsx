import React from 'react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import { mockQueues, mockQueueEntryAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import UndoTransitionQueueEntryModal from './undo-transition-queue-entry.modal';
import VoidQueueEntryModal from './void-queue-entry.modal';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({
      queues: mockQueues,
    }),
  };
});

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
    });
    const user = userEvent.setup();
    renderWithSwr(<UndoTransitionQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Undo transition/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});

describe('VoidQueueEntryModal', () => {
  const queueEntry = mockQueueEntryAlice;

  it('has a cancel button that closes the modal', async () => {
    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<VoidQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has an working submit button', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      status: 200,
    });
    const user = userEvent.setup();
    renderWithSwr(<VoidQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Delete queue entry/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});
