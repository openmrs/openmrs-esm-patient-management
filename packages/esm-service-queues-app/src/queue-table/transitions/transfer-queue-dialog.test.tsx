import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { mockQueueEntryBrian, mockQueueSurgery, mockStatusInService, mockQueues } from '__mocks__';
import React from 'react';
import { renderWithSwr } from 'tools';
import TransferQueueDialog from './transfer-queue-dialog.component';
import userEvent from '@testing-library/user-event';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('../../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({
      queues: mockQueues,
    }),
  };
});

describe('TransferQueueDialog: ', () => {
  const queueEntry = mockQueueEntryBrian;
  const { queue } = queueEntry;
  const { allowedStatuses, allowedPriorities } = queue;

  const nextQueue = mockQueueSurgery;

  it('renders the dialog with the right status and priority options', () => {
    renderWithSwr(<TransferQueueDialog queueEntry={queueEntry} closeModal={() => {}} />);
    expect(screen.getByText(queueEntry.patient.display)).toBeInTheDocument();

    for (const status of allowedStatuses) {
      expect(screen.getByRole('radio', { name: status.display })).toBeInTheDocument();
    }

    for (const pri of allowedPriorities) {
      expect(screen.getByRole('radio', { name: pri.display })).toBeInTheDocument();
    }
  });

  it('has a cancel button that closes the modal', () => {
    const closeModal = jest.fn();

    renderWithSwr(<TransferQueueDialog queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();
    expect(closeModal).toHaveBeenCalled();
  });

  it('has a disabled submit button when selected queue is same as before', () => {
    renderWithSwr(<TransferQueueDialog queueEntry={queueEntry} closeModal={() => {}} />);
    const submitButton = screen.getByRole('button', { name: /Transfer to next queue/ });
    expect(submitButton).toBeDisabled();
  });

  it('has an working submit button when selected queue is different from before', async () => {
    mockedOpenmrsFetch.mockResolvedValue({
      status: 200,
    });
    const user = userEvent.setup();
    renderWithSwr(<TransferQueueDialog queueEntry={queueEntry} closeModal={() => {}} />);

    // change queue
    const queueDropdown = screen.getByRole('combobox');
    await queueDropdown.click();
    const queueSelection = screen.getByRole('option', { name: nextQueue.display });
    await user.selectOptions(queueDropdown, queueSelection);

    const inServiceRadioButton = screen.getByText(mockStatusInService.display);
    await inServiceRadioButton.click();

    const submitButton = screen.getByRole('button', { name: /Transfer to next queue/ });
    expect(submitButton).not.toBeDisabled();
    await submitButton.click();

    expect(mockedOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});
