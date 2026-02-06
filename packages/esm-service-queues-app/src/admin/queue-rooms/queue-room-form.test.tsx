import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useLayoutType, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr';
import QueueRoomForm from './queue-room-form.workspace';

jest.mock('swr', () => ({
  useSWRConfig: jest.fn(),
}));

const mockUseLayoutType = jest.mocked(useLayoutType);
const mockMutate = jest.fn();

jest.mock('../../create-queue-entry/hooks/useQueueLocations', () => ({
  ...jest.requireActual('../../create-queue-entry/hooks/useQueueLocations'),
  useQueueLocations: jest.fn(() => ({
    queueLocations: [{ id: 'e7786d9a-ab62-11ec-b909-0242ac120002', name: 'Location Test' }],
  })),
}));

jest.mock('../../hooks/useQueues', () => ({
  useQueues: jest.fn(() => ({
    queues: [
      { uuid: 'queue-uuid-1', display: 'Queue 1', service: { uuid: 'service-uuid-1' } },
      { uuid: 'queue-uuid-2', display: 'Queue 2', service: { uuid: 'service-uuid-2' } },
    ],
  })),
}));

const workspaceProps = {
  closeWorkspace: jest.fn(),
  setTitle: jest.fn(),
  launchChildWorkspace: jest.fn(),
};

jest.mock('./queue-room.resource', () => ({
  saveQueueRoom: jest.fn().mockResolvedValue({ status: 201 }),
  useServices: jest.fn(() => ({
    services: [
      { uuid: 'service-uuid-1', display: 'Service 1' },
      { uuid: 'service-uuid-2', display: 'Service 2' },
    ],
  })),
}));

describe('QueueRoomForm', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('tablet');
    (useSWRConfig as jest.Mock).mockReturnValue({ mutate: mockMutate });
  });

  it('renders the form with queue room elements', () => {
    render(<QueueRoomForm {...(workspaceProps as any)} />);

    expect(screen.getByLabelText(/queue room name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^queue$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/queue location/i)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('displays error notification if queue room name is missing on submission', async () => {
    const user = userEvent.setup();

    render(<QueueRoomForm {...(workspaceProps as any)} />);

    await user.click(screen.getByText('Save'));
    expect(screen.getByText('Queue is required')).toBeInTheDocument();
  });

  it('displays error notification if queue room service is missing on submission', async () => {
    const user = userEvent.setup();

    render(<QueueRoomForm {...(workspaceProps as any)} />);

    const queueRoomNameInput = screen.getByLabelText('Queue room name');

    await user.type(queueRoomNameInput, 'Room 123');
    await user.click(screen.getByText('Save'));
    expect(screen.getByText('Queue is required')).toBeInTheDocument();
  });

  it('calls closePanel when Cancel button is clicked', async () => {
    const user = userEvent.setup();

    const closeWorkspace = jest.fn();
    render(<QueueRoomForm {...({ ...workspaceProps, closeWorkspace } as any)} />);

    await user.click(screen.getByText('Cancel'));
    expect(closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('updates queue room name state when a value is entered', async () => {
    const user = userEvent.setup();

    render(<QueueRoomForm {...(workspaceProps as any)} />);

    const queueRoomNameInput = screen.getByLabelText('Queue room name');
    await user.type(queueRoomNameInput, 'Room 123');
    expect(queueRoomNameInput).toHaveValue('Room 123');
  });

  it('invalidates the correct cache keys with query parameter pattern on successful creation', async () => {
    const user = userEvent.setup();
    render(<QueueRoomForm {...(workspaceProps as any)} />);

    const queueRoomNameInput = screen.getByLabelText('Queue room name');
    const queueRoomServiceSelect = screen.getByLabelText('Queue');
    const queueLocationSelect = screen.getByLabelText('Queue location');
    const saveButton = screen.getByText('Save');

    await user.type(queueRoomNameInput, 'Room 123');
    await user.selectOptions(queueLocationSelect, 'e7786d9a-ab62-11ec-b909-0242ac120002');
    await user.selectOptions(queueRoomServiceSelect, 'queue-uuid-1');
    await user.click(saveButton);

    expect(mockMutate).toHaveBeenCalledWith(expect.any(Function));
    const mutateCallback = mockMutate.mock.calls[0][0] as (key: unknown) => boolean;

    // Should match queue-room endpoints with query parameters
    expect(mutateCallback('/ws/rest/v1/queue-room?v=full')).toBe(true);
    expect(mutateCallback('/ws/rest/v1/queue-room?status=active')).toBe(true);

    // Should NOT match other endpoints that start with 'queue-room'
    expect(mutateCallback('/ws/rest/v1/queue-room-audit')).toBe(false);
    expect(mutateCallback('/ws/rest/v1/queue-roomtype')).toBe(false);
  });
});
