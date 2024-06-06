import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import { mockQueueEntryBrian, mockQueueSurgery, mockStatusInService, mockQueues } from '__mocks__';
import React from 'react';
import { renderWithSwr } from 'tools';
import TransitionQueueEntryModal from './transition-queue-entry-modal.component';
import userEvent from '@testing-library/user-event';
import EditQueueEntryModal from './edit-queue-entry-modal.component';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({
      queues: mockQueues,
    }),
  };
});

describe('TransitionQueueEntryModal: ', () => {
  const queueEntry = mockQueueEntryBrian;
  const { queue } = queueEntry;
  const { allowedStatuses, allowedPriorities } = queue;

  const nextQueue = mockQueueSurgery;

  it('renders the dialog with the right status and priority options', () => {
    renderWithSwr(<TransitionQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);
    expect(screen.getByText(queueEntry.patient.display)).toBeInTheDocument();

    for (const status of allowedStatuses) {
      const expectedStatusDisplay =
        queueEntry.status.uuid == status.uuid ? `${status.display} (Current)` : status.display;
      expect(screen.getByRole('radio', { name: expectedStatusDisplay })).toBeInTheDocument();
    }

    for (const pri of allowedPriorities) {
      const expectedPriorityDisplay = queueEntry.priority.uuid == pri.uuid ? `${pri.display} (Current)` : pri.display;
      expect(screen.getByRole('radio', { name: expectedPriorityDisplay })).toBeInTheDocument();
    }
  });

  it('has a cancel button that closes the modal', async () => {
    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<TransitionQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has a disabled submit button when selected queue and status is same as before', () => {
    renderWithSwr(<TransitionQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);
    const submitButton = screen.getByRole('button', { name: /Transition patient/ });
    expect(submitButton).toBeDisabled();
  });

  it('has an working submit button when selected queue and status is different from before', async () => {
    mockedOpenmrsFetch.mockResolvedValue({
      status: 200,
    });
    const user = userEvent.setup();
    renderWithSwr(<TransitionQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    // change queue
    const queueDropdown = screen.getByRole('combobox', { name: /Select a queue/ });
    await queueDropdown.click();
    const queueSelection = screen.getByRole('option', {
      name: `${nextQueue.display} - ${nextQueue.location?.display}`,
    });
    await user.selectOptions(queueDropdown, queueSelection);

    // change status
    const inServiceRadioButton = screen.getByText(mockStatusInService.display);
    await inServiceRadioButton.click();

    const submitButton = screen.getByRole('button', { name: /Transition patient/ });
    expect(submitButton).not.toBeDisabled();
    await submitButton.click();

    expect(mockedOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});

describe('EditQueueEntryModal: ', () => {
  const queueEntry = mockQueueEntryBrian;
  const { queue } = queueEntry;
  const { allowedStatuses, allowedPriorities } = queue;

  const nextQueue = mockQueueSurgery;

  it('renders the dialog with the right status and priority options', () => {
    renderWithSwr(<EditQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);
    expect(screen.getByText(queueEntry.patient.display)).toBeInTheDocument();

    for (const status of allowedStatuses) {
      const expectedStatusDisplay =
        queueEntry.status.uuid == status.uuid ? `${status.display} (Current)` : status.display;
      expect(screen.getByRole('radio', { name: expectedStatusDisplay })).toBeInTheDocument();
    }

    for (const pri of allowedPriorities) {
      const expectedPriorityDisplay = queueEntry.priority.uuid == pri.uuid ? `${pri.display} (Current)` : pri.display;
      expect(screen.getByRole('radio', { name: expectedPriorityDisplay })).toBeInTheDocument();
    }
  });

  it('has a cancel button that closes the modal', async () => {
    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<EditQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has a enabled submit button when selected queue and status is same as before', () => {
    renderWithSwr(<EditQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);
    const submitButton = screen.getByRole('button', { name: /Edit queue entry/ });
    expect(submitButton).toBeEnabled();
  });

  it('has an working submit button when selected queue and status is different from before', async () => {
    mockedOpenmrsFetch.mockResolvedValue({
      status: 200,
    });
    const user = userEvent.setup();
    renderWithSwr(<EditQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    // change queue
    const queueDropdown = screen.getByRole('combobox', { name: /Select a queue/ });
    await queueDropdown.click();
    const queueSelection = screen.getByRole('option', {
      name: `${nextQueue.display} - ${nextQueue.location?.display}`,
    });
    await user.selectOptions(queueDropdown, queueSelection);

    // change status
    const inServiceRadioButton = screen.getByText(mockStatusInService.display);
    await inServiceRadioButton.click();

    const submitButton = screen.getByRole('button', { name: /Edit queue entry/ });
    expect(submitButton).not.toBeDisabled();
    await submitButton.click();

    expect(mockedOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});
