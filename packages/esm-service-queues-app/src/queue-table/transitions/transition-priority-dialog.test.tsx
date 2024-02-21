import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { mockQueueEntryBrian, mockPriorityUrgent } from '__mocks__';
import React from 'react';
import { renderWithSwr } from 'tools';
import TransitionPriorityDialog from './transition-priority-dialog.component';
import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

describe('TransitionPriorityDialog: ', () => {
  const queueEntry = mockQueueEntryBrian;
  const { queue } = queueEntry;
  const { allowedPriorities } = queue;

  it('renders the dialog with the right priority options', () => {
    renderWithSwr(<TransitionPriorityDialog queueEntry={queueEntry} closeModal={() => {}} />);
    expect(screen.getByText(queueEntry.patient.display)).toBeInTheDocument();
    for (const pri of allowedPriorities) {
      expect(screen.getByRole('radio', { name: pri.display })).toBeInTheDocument();
    }
  });

  it('has a cancel button that closes the modal', () => {
    const closeModal = jest.fn();

    renderWithSwr(<TransitionPriorityDialog queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();
    expect(closeModal).toHaveBeenCalled();
  });

  it('has a disabled submit button when selected priority is same as before', () => {
    renderWithSwr(<TransitionPriorityDialog queueEntry={queueEntry} closeModal={() => {}} />);
    expect(screen.getByRole('button', { name: /Transition priority/ })).toBeDisabled();
  });

  it('has an working submit button when selected priority is different from before', async () => {
    mockedOpenmrsFetch.mockResolvedValue({
      status: 200,
    });

    renderWithSwr(<TransitionPriorityDialog queueEntry={queueEntry} closeModal={() => {}} />);
    const urgentButton = screen.getByRole('radio', { name: mockPriorityUrgent.display });
    await urgentButton.click();

    const submitButton = screen.getByRole('button', { name: /Transition priority/ });
    expect(submitButton).not.toBeDisabled();
    await submitButton.click();

    expect(mockedOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});
