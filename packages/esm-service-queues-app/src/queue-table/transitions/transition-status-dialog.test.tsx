import { openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { mockQueueEntryBrian, mockStatusInService } from '__mocks__';
import React from 'react';
import { renderWithSwr } from 'tools';
import TransitionStatusDialog from './transition-status-dialog.component';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;

describe('TransitionStatusDialog: ', () => {
  const queueEntry = mockQueueEntryBrian;
  const { queue } = queueEntry;
  const { allowedStatuses } = queue;

  it('renders the dialog with the right status options', () => {
    renderWithSwr(<TransitionStatusDialog queueEntry={queueEntry} closeModal={() => {}} />);
    expect(screen.getByText(queueEntry.patient.display)).toBeInTheDocument();
    for (const status of allowedStatuses) {
      expect(screen.getByRole('radio', { name: status.display })).toBeInTheDocument();
    }
  });

  it('has a cancel button that closes the modal', () => {
    const closeModal = jest.fn();

    renderWithSwr(<TransitionStatusDialog queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    cancelButton.click();
    expect(closeModal).toHaveBeenCalled();
  });

  it('has a disabled submit button when selected status is same as before', () => {
    renderWithSwr(<TransitionStatusDialog queueEntry={queueEntry} closeModal={() => {}} />);
    expect(screen.getByRole('button', { name: /Transition status/ })).toBeDisabled();
  });

  it('has an working submit button when selected status is different from before', async () => {
    mockedOpenmrsFetch.mockResolvedValue({
      status: 200,
    });

    renderWithSwr(<TransitionStatusDialog queueEntry={queueEntry} closeModal={() => {}} />);

    const inServiceRadioButton = screen.getByRole('radio', { name: mockStatusInService.display });
    await inServiceRadioButton.click();

    const submitButton = screen.getByRole('button', { name: /Transition status/ });
    expect(submitButton).not.toBeDisabled();
    await submitButton.click();

    expect(mockedOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});
