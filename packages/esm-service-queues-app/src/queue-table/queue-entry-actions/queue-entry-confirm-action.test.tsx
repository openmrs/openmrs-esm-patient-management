import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import { mockQueues, mockQueueEntryAlice } from '__mocks__';
import React from 'react';
import { renderWithSwr } from 'tools';
import userEvent from '@testing-library/user-event';
import UndoTransitionQueueEntryModal from './undo-transition-queue-entry.modal';
import VoidQueueEntryModal from './void-queue-entry.modal';
import EndQueueEntryModal from './end-queue-entry.modal';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({
      queues: mockQueues,
    }),
  };
});

describe('UndoTransitionQueueEntryModal: ', () => {
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
    mockedOpenmrsFetch.mockResolvedValue({
      status: 200,
    });
    const user = userEvent.setup();
    renderWithSwr(<UndoTransitionQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Undo transition/ });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(mockedOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});

describe('VoidQueueEntryModal: ', () => {
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
    mockedOpenmrsFetch.mockResolvedValue({
      status: 200,
    });
    const user = userEvent.setup();
    renderWithSwr(<VoidQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Delete queue entry/ });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(mockedOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});

describe('EndQueueEntryModal: ', () => {
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
    mockedOpenmrsFetch.mockResolvedValue({
      status: 200,
    });
    const user = userEvent.setup();
    renderWithSwr(<EndQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Remove patient/ });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    expect(mockedOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});
