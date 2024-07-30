import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { type FetchResponse, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { mockQueues, mockQueueEntryAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import EndQueueEntryModal from './end-queue-entry.modal';
import UndoTransitionQueueEntryModal from './undo-transition-queue-entry.modal';
import VoidQueueEntryModal from './void-queue-entry.modal';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

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

    renderWithSwr(<VoidQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has an working submit button', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      status: 200,
    } as unknown as FetchResponse);

    const user = userEvent.setup();
    renderWithSwr(<VoidQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

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

    renderWithSwr(<EndQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has an working submit button', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      status: 200,
    } as unknown as FetchResponse);

    const user = userEvent.setup();

    renderWithSwr(<EndQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Remove patient/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(showSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      subtitle: 'Paient removed from queue successfully',
      title: 'Patient removed',
    });
  });
});
