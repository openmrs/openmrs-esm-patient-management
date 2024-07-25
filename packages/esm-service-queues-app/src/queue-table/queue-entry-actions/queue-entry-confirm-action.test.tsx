import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { mockQueues, mockQueueEntryAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import EndQueueEntryModal from './end-queue-entry.modal';
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

describe('EndQueueEntryModal', () => {
  const queueEntry = mockQueueEntryAlice;

  it('has a cancel button that closes the modal', async () => {
    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<EndQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has an working submit button', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      status: 200,
    });
    const user = userEvent.setup();
    renderWithSwr(<EndQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Remove patient/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});
