import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddProviderQueueRoom from './add-provider-queue-room.component';
import { showSnackbar } from '@openmrs/esm-framework';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useCurrentProvider: jest.fn(() => ({
    currentProvider: { uuid: 'provider-uuid-1' },
  })),
  showSnackbar: jest.fn(),
}));
jest.mock('./add-provider-queue-room.resource', () => ({
  useProvidersQueueRoom: jest.fn(() => ({
    providerRoom: [
      {
        queueRoom: { uuid: 'c187d78b-5c54-49bf-a0f8-b7fb6034d36d' },
        uuid: '6b3e233d-2b44-40ca-b0c8-c5a57a8c51b6',
      },
    ],
    isLoading: false,
    mutate: jest.fn(),
  })),
  updateProviderToQueueRoom: jest.fn().mockResolvedValue({ status: 200 }),
  addProviderToQueueRoom: jest.fn(),
  useQueueRooms: jest.fn(() => ({
    rooms: [
      { uuid: '6b3e233d-2b44-40ca-b0c8-c5a57a8c51b6', display: 'Room 1' },
      { uuid: 'e7786ac0-ab62-11ec-b909-0242ac120002', display: 'Room 2' },
    ],
  })),
}));

jest.mock('../active-visits/active-visits-table.resource', () => ({
  useServices: jest.fn(() => ({
    services: [
      { uuid: 'e7786ac0-ab62-11ec-b909-0242ac120002', display: 'Service 1' },
      { uuid: 'e7786ac0-ab62-11ec-b909-0242ac120032', display: 'Service 2' },
    ],
  })),
}));

jest.mock('../patient-search/hooks/useQueueLocations', () => ({
  useQueueLocations: jest.fn(() => ({
    queueLocations: [
      { id: '1GHI12', name: 'Location 1' },
      { id: '1GHI45', name: 'Location 2' },
    ],
  })),
}));

const providerUuid = 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d';

describe('AddProviderQueueRoom', () => {
  it('renders the form fields', () => {
    render(<AddProviderQueueRoom providerUuid={providerUuid} closeModal={jest.fn()} />);

    expect(screen.getByText('Select a room')).toBeInTheDocument();
    expect(screen.getByLabelText('Retain location')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('updates queue room selection', () => {
    render(<AddProviderQueueRoom providerUuid={providerUuid} closeModal={jest.fn()} />);

    const selectQueueRoom: HTMLInputElement = screen.getByRole('combobox');
    fireEvent.change(selectQueueRoom, { target: { value: 'room-uuid-1' } });

    expect(selectQueueRoom.value).toBe('6b3e233d-2b44-40ca-b0c8-c5a57a8c51b6');
  });

  it('should update the retain location checkbox', () => {
    render(<AddProviderQueueRoom providerUuid={providerUuid} closeModal={jest.fn()} />);

    const retainLocationCheckbox: HTMLInputElement = screen.getByRole('checkbox');
    fireEvent.click(retainLocationCheckbox);

    expect(retainLocationCheckbox.checked).toBe(true);
  });

  it('should submit the form and add provider to queue room when all fields are filled', async () => {
    const mockCloseModal = jest.fn();
    render(<AddProviderQueueRoom providerUuid={providerUuid} closeModal={mockCloseModal} />);

    const queueRoomSelect = screen.getByRole('combobox');
    const submitButton = screen.getByText('Save');

    fireEvent.change(queueRoomSelect, { target: { value: '6b3e233d-2b44-40ca-b0c8-c5a57a8c51b6' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCloseModal).toHaveBeenCalled();
      expect(showSnackbar).toHaveBeenCalled();
    });
  });
});
