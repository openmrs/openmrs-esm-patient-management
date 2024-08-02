import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { showSnackbar } from '@openmrs/esm-framework';
import AddProviderQueueRoom from './add-provider-queue-room.component';

const mockCloseModal = jest.fn();
const mockShowSnackbar = jest.mocked(showSnackbar);

jest.mock('./add-provider-queue-room.resource', () => ({
  addProviderToQueueRoom: jest.fn(),
  updateProviderToQueueRoom: jest.fn().mockResolvedValue({ status: 200 }),
  useProvidersQueueRoom: jest.fn().mockReturnValue({
    providerRoom: [
      {
        queueRoom: { uuid: 'c187d78b-5c54-49bf-a0f8-b7fb6034d36d' },
        uuid: '6b3e233d-2b44-40ca-b0c8-c5a57a8c51b6',
      },
    ],
    isLoading: false,
    mutate: jest.fn(),
  }),
  useQueueRooms: jest.fn().mockReturnValue({
    rooms: [
      { uuid: '6b3e233d-2b44-40ca-b0c8-c5a57a8c51b6', display: 'Room 1' },
      { uuid: 'e7786ac0-ab62-11ec-b909-0242ac120002', display: 'Room 2' },
    ],
  }),
}));

jest.mock('../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({
      queues: [
        { uuid: 'e7786ac0-ab62-11ec-b909-0242ac120002', display: 'Service 1' },
        { uuid: 'e7786ac0-ab62-11ec-b909-0242ac120032', display: 'Service 2' },
      ],
    }),
  };
});

jest.mock('../patient-search/hooks/useQueueLocations', () => ({
  useQueueLocations: jest.fn().mockReturnValue({
    queueLocations: [
      { id: '1GHI12', name: 'Location 1' },
      { id: '1GHI45', name: 'Location 2' },
    ],
  }),
}));

const providerUuid = 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d';
const defaultProps = {
  providerUuid,
  closeModal: mockCloseModal,
};

describe('AddProviderQueueRoom', () => {
  it('renders the form fields', () => {
    renderAddProviderQueueRoom();

    expect(screen.getByText('Select a room')).toBeInTheDocument();
    expect(screen.getByLabelText('Retain location')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('updates the queue room selection', async () => {
    const user = userEvent.setup();
    renderAddProviderQueueRoom();

    const queueLocationDropdown = screen.getByRole('combobox', { name: /queue location/i });
    await user.click(queueLocationDropdown);
    await user.click(screen.getByText('Room 1'));

    expect(screen.getByText('Room 1')).toBeInTheDocument();
  });

  it('should update the retain location checkbox', async () => {
    const user = userEvent.setup();
    renderAddProviderQueueRoom();

    const retainLocationCheckbox: HTMLInputElement = screen.getByRole('checkbox');
    await user.click(retainLocationCheckbox);

    expect(retainLocationCheckbox).toBeChecked();
  });

  it('should submit the form and add provider to queue room when all fields are filled', async () => {
    const user = userEvent.setup();
    renderAddProviderQueueRoom();

    const submitButton = screen.getByText('Save');
    const queueLocationDropdown = screen.getByRole('combobox', { name: /queue location/i });
    await user.click(queueLocationDropdown);
    await user.click(screen.getByText('Room 1'));
    await user.click(submitButton);

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      subtitle: 'Queue room updated successfully',
      title: 'Update room',
    });
  });
});

function renderAddProviderQueueRoom(props = {}) {
  render(<AddProviderQueueRoom {...defaultProps} {...props} />);
}
