import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import QueueRoomForm from './queue-room-form.workspace';

const mockUseLayoutType = jest.mocked(useLayoutType);

jest.mock('../patient-search/hooks/useQueueLocations', () => ({
  ...jest.requireActual('../patient-search/hooks/useQueueLocations'),
  useQueueLocations: jest.fn(() => ({
    queueLocations: { uuid: 'e7786d9a-ab62-11ec-b909-0242ac120002', display: 'Location Test' },
  })),
}));

const workspaceProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
};

jest.mock('./queue-room.resource', () => ({
  saveQueueRoom: jest.fn(() => Promise.resolve({ status: 201 })),
}));

describe('QueueRoomForm', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('tablet');
  });

  it('renders the form with queue room elements', () => {
    render(<QueueRoomForm {...workspaceProps} />);

    expect(screen.getByLabelText('Queue room name')).toBeInTheDocument();
    expect(screen.getByLabelText('Select a service')).toBeInTheDocument();
    expect(screen.getByLabelText('Select a queue location')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('displays error notification if queue room name is missing on submission', async () => {
    const user = userEvent.setup();

    render(<QueueRoomForm {...workspaceProps} />);

    await user.click(screen.getByText('Save'));
    expect(screen.getByText('Missing queue room name')).toBeInTheDocument();
  });

  it('displays error notification if queue room service is missing on submission', async () => {
    const user = userEvent.setup();

    render(<QueueRoomForm {...workspaceProps} />);

    const queueRoomNameInput = screen.getByLabelText('Queue room name');

    await user.type(queueRoomNameInput, 'Room 123');
    await user.click(screen.getByText('Save'));
    expect(screen.getByText('Missing queue room service')).toBeInTheDocument();
  });

  it('calls closePanel when Cancel button is clicked', async () => {
    const user = userEvent.setup();

    const closeWorkspace = jest.fn();
    render(<QueueRoomForm {...{ ...workspaceProps, closeWorkspace }} />);

    await user.click(screen.getByText('Cancel'));
    expect(closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('updates queue room name state when a value is entered', async () => {
    const user = userEvent.setup();

    render(<QueueRoomForm {...workspaceProps} />);

    const queueRoomNameInput = screen.getByLabelText('Queue room name');
    await user.type(queueRoomNameInput, 'Room 123');
    expect(queueRoomNameInput).toHaveValue('Room 123');
  });
});
