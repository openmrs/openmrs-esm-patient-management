import React from 'react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, openmrsFetch, showSnackbar } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import { mockQueues, mockQueueEntryAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import DeleteQueueEntryModal from './delete-queue-entry.modal';
import QueueEntryActionModal from './queue-entry-actions-modal.component';
import UndoTransitionQueueEntryModal from './undo-transition-queue-entry.modal';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

jest.mock('../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({
      queues: mockQueues,
    }),
  };
});

jest.mock('../hooks/useQueueEntries', () => {
  return {
    useMutateQueueEntries: jest.fn().mockReturnValue({
      mutateQueueEntries: jest.fn(),
    }),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    useConfig: jest.fn().mockReturnValue({
      showQueueNumber: true,
      showPriorityComment: true,
      showTransitionDateTime: true,
      priorityConfigs: [
        {
          conceptUuid: 'f4620bfa-3625-4883-bd3f-84c2cce14470',
          style: null,
          color: 'green',
        },
        {
          conceptUuid: 'dc3492ef-24a5-4fd9-b58d-4fd2acf7071f',
          style: null,
          color: 'orange',
        },
      ],
      concepts: {
        defaultPriorityConceptUuid: 'f4620bfa-3625-4883-bd3f-84c2cce14470',
        defaultStatusConceptUuid: '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
        defaultTransitionStatus: 'ca7494ae-437f-4fd0-8aae-b88b9a2ba47d',
      },
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
      data: [],
    } as unknown as FetchResponse);

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

    renderWithSwr(<DeleteQueueEntryModal queueEntry={queueEntry} closeModal={closeModal} />);
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalled();
  });

  it('has an working submit button', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      status: 200,
      data: [],
    } as unknown as FetchResponse);

    const user = userEvent.setup();

    renderWithSwr(<DeleteQueueEntryModal queueEntry={queueEntry} closeModal={() => {}} />);

    const submitButton = screen.getByRole('button', { name: /Delete queue entry/ });
    expect(submitButton).toBeEnabled();
    await user.click(submitButton);

    expect(mockOpenmrsFetch).toHaveBeenCalled();
    expect(showSnackbar).toHaveBeenCalled();
  });
});

describe('QueueEntryActionModal', () => {
  const defaultProps = {
    queueEntry: mockQueueEntryAlice,
    closeModal: jest.fn(),
    modalParams: {
      modalTitle: 'Test Modal',
      modalInstruction: 'Test instruction',
      submitButtonText: 'Submit',
      submitSuccessTitle: 'Success',
      submitSuccessText: 'Operation completed',
      submitFailureTitle: 'Submission Failed',
      submitAction: jest.fn(),
      disableSubmit: jest.fn().mockReturnValue(false),
      isEdit: false,
      showQueuePicker: true,
      showStatusPicker: true,
    },
  };

  it('renders with correct content', () => {
    renderWithSwr(<QueueEntryActionModal {...defaultProps} />);

    expect(screen.getByText('Test instruction')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows inline error notification when submission fails with duplicate error', async () => {
    const mockSubmitAction = jest.fn().mockRejectedValue({
      responseBody: {
        error: {
          message: '[queue.entry.duplicate.patient]',
        },
      },
    });

    const user = userEvent.setup();
    renderWithSwr(
      <QueueEntryActionModal
        {...defaultProps}
        modalParams={{
          ...defaultProps.modalParams,
          submitAction: mockSubmitAction,
        }}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(await screen.findByText('This patient is already in the selected queue.')).toBeInTheDocument();
    expect(screen.getByText('Patient already in queue')).toBeInTheDocument();
  });

  it('shows inline error notification when submission fails with generic error', async () => {
    const mockSubmitAction = jest.fn().mockRejectedValue({
      message: 'Network error occurred',
    });

    const user = userEvent.setup();
    renderWithSwr(
      <QueueEntryActionModal
        {...defaultProps}
        modalParams={{
          ...defaultProps.modalParams,
          submitAction: mockSubmitAction,
        }}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(await screen.findByText('Network error occurred')).toBeInTheDocument();
    expect(screen.getByText('Submission Failed')).toBeInTheDocument();
  });

  it('clears error when user changes queue selection', async () => {
    const mockSubmitAction = jest.fn().mockRejectedValue({
      message: 'Test error',
    });

    const user = userEvent.setup();
    renderWithSwr(
      <QueueEntryActionModal
        {...defaultProps}
        modalParams={{
          ...defaultProps.modalParams,
          submitAction: mockSubmitAction,
        }}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(await screen.findByText('Test error')).toBeInTheDocument();

    const firstQueueOption = screen.getByRole('radio', { name: 'Triage - Triage' });
    await user.click(firstQueueOption);

    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
  });

  it('clears error when user changes priority', async () => {
    const mockSubmitAction = jest.fn().mockRejectedValue({
      message: 'Test error',
    });

    const user = userEvent.setup();
    renderWithSwr(
      <QueueEntryActionModal
        {...defaultProps}
        modalParams={{
          ...defaultProps.modalParams,
          submitAction: mockSubmitAction,
        }}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(await screen.findByText('Test error')).toBeInTheDocument();

    const priorityOption = screen.getByRole('radio', { name: 'Non urgent' });
    await user.click(priorityOption);

    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
  });

  it('clears error when user changes status', async () => {
    const mockSubmitAction = jest.fn().mockRejectedValue({
      message: 'Test error',
    });

    const user = userEvent.setup();
    renderWithSwr(
      <QueueEntryActionModal
        {...defaultProps}
        modalParams={{
          ...defaultProps.modalParams,
          submitAction: mockSubmitAction,
        }}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(await screen.findByText('Test error')).toBeInTheDocument();

    const statusOption = screen.getByRole('radio', { name: 'Waiting' });
    await user.click(statusOption);

    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
  });

  it('submits form successfully without errors', async () => {
    const mockSubmitAction = jest.fn().mockResolvedValue({ status: 200 });
    const closeModal = jest.fn();

    const user = userEvent.setup();
    renderWithSwr(
      <QueueEntryActionModal
        {...defaultProps}
        closeModal={closeModal}
        modalParams={{
          ...defaultProps.modalParams,
          submitAction: mockSubmitAction,
        }}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(mockSubmitAction).toHaveBeenCalled();
    expect(closeModal).toHaveBeenCalled();
  });

  it('closes modal when cancel button is clicked', async () => {
    const closeModal = jest.fn();
    const user = userEvent.setup();

    renderWithSwr(<QueueEntryActionModal {...defaultProps} closeModal={closeModal} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(closeModal).toHaveBeenCalled();
  });

  it('allows user to close error notification', async () => {
    const mockSubmitAction = jest.fn().mockRejectedValue({
      message: 'Test error',
    });

    const user = userEvent.setup();
    renderWithSwr(
      <QueueEntryActionModal
        {...defaultProps}
        modalParams={{
          ...defaultProps.modalParams,
          submitAction: mockSubmitAction,
        }}
      />,
    );

    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    const errorNotification = await screen.findByText('Test error');
    expect(errorNotification).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'close notification' });
    await user.click(closeButton);

    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
  });
});
