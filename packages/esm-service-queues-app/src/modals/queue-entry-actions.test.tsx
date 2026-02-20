import React from 'react';
import userEvent from '@testing-library/user-event';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  openmrsFetch,
  showSnackbar,
  useConfig,
} from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import {
  mockQueueAltPriorities,
  mockQueueEntryAlice,
  mockQueueEntryNoPriorities,
  mockQueueEntryNoStatuses,
  mockQueues,
  mockQueuesForComboBox,
  mockQueueNoPriorities,
  mockQueueNoStatuses,
} from '__mocks__';
import { renderWithSwr } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import DeleteQueueEntryModal from './delete-queue-entry.modal';
import QueueEntryActionModal from './queue-entry-actions-modal.component';
import UndoTransitionQueueEntryModal from './undo-transition-queue-entry.modal';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

const mockUseQueues = jest.fn().mockReturnValue({ queues: mockQueues });

jest.mock('../hooks/useQueues', () => ({
  useQueues: () => mockUseQueues(),
}));

jest.mock('../create-queue-entry/hooks/useQueueLocations', () => ({
  useQueueLocations: jest.fn(() => ({ queueLocations: [], isLoading: false, error: undefined })),
}));

jest.mock('../hooks/useQueueEntries', () => {
  return {
    useMutateQueueEntries: jest.fn().mockReturnValue({
      mutateQueueEntries: jest.fn(),
    }),
  };
});

beforeEach(() => {
  mockUseConfig.mockReturnValue({
    ...getDefaultsFromConfigSchema(configSchema),
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
      ...getDefaultsFromConfigSchema(configSchema).concepts,
      defaultPriorityConceptUuid: 'f4620bfa-3625-4883-bd3f-84c2cce14470',
      defaultStatusConceptUuid: '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
      defaultTransitionStatus: 'ca7494ae-437f-4fd0-8aae-b88b9a2ba47d',
    },
  } as ConfigObject);
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

  it('closes modal and shows warning snackbar when submission fails with already-ended error', async () => {
    const mockSubmitAction = jest.fn().mockRejectedValue({
      responseBody: {
        error: {
          message: 'Cannot transition a queue entry that has already ended',
        },
      },
    });

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

    expect(showSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'warning',
        title: 'Queue entry is no longer active',
      }),
    );
    expect(closeModal).toHaveBeenCalled();
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

  it('shows error when server returns non-200 status', async () => {
    const mockSubmitAction = jest.fn().mockResolvedValue({ status: 201 });
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

    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(await screen.findByText('Unexpected Server Response')).toBeInTheDocument();
  });

  it('initializes transition date from queue entry when isEdit is true', async () => {
    const mockSubmitAction = jest.fn().mockResolvedValue({ status: 200 });
    const user = userEvent.setup();

    renderWithSwr(
      <QueueEntryActionModal
        {...defaultProps}
        modalParams={{
          ...defaultProps.modalParams,
          submitAction: mockSubmitAction,
          isEdit: true,
        }}
      />,
    );

    const nowCheckbox = screen.getByRole('checkbox', { name: 'Now' });
    await user.click(nowCheckbox);
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const [, formState] = mockSubmitAction.mock.calls[0];
    expect(formState.transitionDate.getTime()).toBe(new Date(mockQueueEntryAlice.startedAt).getTime());
  });

  describe('empty configuration states', () => {
    afterEach(() => {
      mockUseQueues.mockReturnValue({ queues: mockQueues });
    });

    it('shows no-statuses configured notification when no statuses are configured', () => {
      mockUseQueues.mockReturnValue({ queues: [mockQueueNoStatuses] });
      renderWithSwr(<QueueEntryActionModal {...defaultProps} queueEntry={mockQueueEntryNoStatuses} />);
      expect(screen.getByText(/no status configured/i)).toBeInTheDocument();
    });

    it('shows no-priorities configured notification when no priorities are configured', () => {
      mockUseQueues.mockReturnValue({ queues: [mockQueueNoPriorities] });
      renderWithSwr(<QueueEntryActionModal {...defaultProps} queueEntry={mockQueueEntryNoPriorities} />);
      expect(screen.getByText(/no priorities configured/i)).toBeInTheDocument();
    });

    it('switching to a queue without current priority falls back to first allowed priority', async () => {
      mockUseQueues.mockReturnValue({ queues: [mockQueueAltPriorities, ...mockQueues] });
      const user = userEvent.setup();
      renderWithSwr(<QueueEntryActionModal {...defaultProps} />);

      const altQueueOption = screen.getByRole('radio', { name: /AltPriority/i });
      await user.click(altQueueOption);

      expect(screen.getByRole('radio', { name: /Urgent/i })).toBeChecked();
    });
  });

  it('passes updated comment to submitAction', async () => {
    const mockSubmitAction = jest.fn().mockResolvedValue({ status: 200 });
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

    const comment = screen.getByPlaceholderText('Enter comment here');
    await user.clear(comment);
    await user.type(comment, 'New comment');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const [, formState] = mockSubmitAction.mock.calls[0];
    expect(formState.priorityComment).toBe('New comment');
  });
});

describe('QueueEntryActionModal - ComboBox behavior with many queues', () => {
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
      submitAction: jest.fn().mockResolvedValue({ status: 200 }),
      disableSubmit: jest.fn().mockReturnValue(false),
      isEdit: false,
      showQueuePicker: true,
      showStatusPicker: false,
    },
  };

  beforeEach(() => {
    mockUseQueues.mockReturnValue({ queues: mockQueuesForComboBox });
  });

  afterEach(() => {
    mockUseQueues.mockReturnValue({ queues: mockQueues });
  });

  it('renders a searchable ComboBox instead of radio buttons when there are more than 8 queues', () => {
    renderWithSwr(<QueueEntryActionModal {...defaultProps} />);

    // Should render ComboBox for queue selection
    expect(screen.getByRole('combobox', { name: /service location/i })).toBeInTheDocument();
    expect(screen.getByText('Service location')).toBeInTheDocument();

    // Should NOT render radio buttons for queue selection (no radiogroup with queue name)
    expect(screen.queryByRole('radio', { name: /Triage - Main Hospital/i })).not.toBeInTheDocument();
  });

  it('displays the current queue with "(Current)" suffix in the ComboBox', () => {
    renderWithSwr(<QueueEntryActionModal {...defaultProps} />);

    const combobox = screen.getByRole('combobox', { name: /service location/i });
    // mockQueueEntryAlice is in mockQueueSurgery
    expect(combobox).toHaveValue('Surgery - Surgery (Current)');
  });

  it('filters queues by name when user types in the search box', async () => {
    const user = userEvent.setup();
    renderWithSwr(<QueueEntryActionModal {...defaultProps} />);

    const combobox = screen.getByRole('combobox', { name: /service location/i });
    await user.clear(combobox);
    await user.type(combobox, 'Cardio');

    // Should show Cardiology option
    expect(screen.getByRole('option', { name: 'Cardiology - Heart Center' })).toBeInTheDocument();

    // Should not show unrelated queues
    expect(screen.queryByRole('option', { name: /Pharmacy/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Pediatrics/i })).not.toBeInTheDocument();
  });

  it('filters queues by location name when user types in the search box', async () => {
    const user = userEvent.setup();
    renderWithSwr(<QueueEntryActionModal {...defaultProps} />);

    const combobox = screen.getByRole('combobox', { name: /service location/i });
    await user.clear(combobox);
    await user.type(combobox, 'Heart Center');

    // Should show queue at Heart Center location
    expect(screen.getByRole('option', { name: 'Cardiology - Heart Center' })).toBeInTheDocument();

    // Should not show queues at other locations
    expect(screen.queryByRole('option', { name: /Main Hospital/i })).not.toBeInTheDocument();
  });

  it('allows user to select a queue from filtered results', async () => {
    const mockSubmitAction = jest.fn().mockResolvedValue({ status: 200 });
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

    const combobox = screen.getByRole('combobox', { name: /service location/i });
    await user.clear(combobox);
    await user.type(combobox, 'Pediatrics');

    const option = screen.getByRole('option', { name: 'Pediatrics - Children Wing' });
    await user.click(option);

    // Verify the selection is reflected in the combobox
    expect(combobox).toHaveValue('Pediatrics - Children Wing');

    // Submit and verify the selected queue is passed
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(mockSubmitAction).toHaveBeenCalled();
  });

  it('clears submission error when user selects a different queue via ComboBox', async () => {
    const mockSubmitAction = jest.fn().mockRejectedValueOnce({ message: 'Test error' });
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

    // Trigger an error
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);
    expect(await screen.findByText('Test error')).toBeInTheDocument();

    // Select a different queue
    const combobox = screen.getByRole('combobox', { name: /service location/i });
    await user.clear(combobox);
    await user.type(combobox, 'Laboratory');
    const option = screen.getByRole('option', { name: 'Laboratory - Main Hospital' });
    await user.click(option);

    // Error should be cleared
    expect(screen.queryByText('Test error')).not.toBeInTheDocument();
  });

  it('performs case-insensitive search', async () => {
    const user = userEvent.setup();
    renderWithSwr(<QueueEntryActionModal {...defaultProps} />);

    const combobox = screen.getByRole('combobox', { name: /service location/i });
    await user.clear(combobox);
    await user.type(combobox, 'RADIOLOGY');

    expect(screen.getByRole('option', { name: 'Radiology - Imaging Center' })).toBeInTheDocument();
  });
});
