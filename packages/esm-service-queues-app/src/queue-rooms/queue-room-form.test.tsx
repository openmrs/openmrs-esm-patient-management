import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QueueRoomForm from './queue-room-form.component';
import { mockServices } from '../../__mocks__/active-visits.mock';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useLayoutType: jest.fn(() => 'tablet'),
  useServices: jest.fn(() => ({ services: mockServices })),
  useQueueLocations: jest.fn(() => ({
    queueLocations: { uuid: 'e7786d9a-ab62-11ec-b909-0242ac120002', display: 'Location Test' },
  })),
  showToast: jest.fn(),
}));

jest.mock('./queue-room.resource', () => ({
  saveQueueRoom: jest.fn(() => Promise.resolve({ status: 201 })),
}));

describe('QueueRoomForm', () => {
  it('renders the form with queue room elements', () => {
    render(<QueueRoomForm toggleSearchType={jest.fn()} closePanel={jest.fn()} />);

    expect(screen.getByLabelText('Queue room name')).toBeInTheDocument();
    expect(screen.getByLabelText('Select a service')).toBeInTheDocument();
    expect(screen.getByLabelText('Select a queue location')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('displays error notification if queue room name is missing on submission', () => {
    render(<QueueRoomForm toggleSearchType={jest.fn()} closePanel={jest.fn()} />);

    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Missing queue room name')).toBeInTheDocument();
  });

  it('displays error notification if queue room service is missing on submission', () => {
    render(<QueueRoomForm toggleSearchType={jest.fn()} closePanel={jest.fn()} />);

    fireEvent.change(screen.getByLabelText('Queue room name'), { target: { value: 'Room 123' } });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Missing queue room service')).toBeInTheDocument();
  });

  it('calls closePanel when Cancel button is clicked', () => {
    const closePanelMock = jest.fn();
    render(<QueueRoomForm toggleSearchType={jest.fn()} closePanel={closePanelMock} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(closePanelMock).toHaveBeenCalledTimes(1);
  });

  it('updates queue room name state when a value is entered', () => {
    render(<QueueRoomForm toggleSearchType={jest.fn()} closePanel={jest.fn()} />);

    const queueRoomNameInput = screen.getByLabelText('Queue room name');
    fireEvent.change(queueRoomNameInput, { target: { value: 'Room 123' } });

    expect(queueRoomNameInput).toHaveValue('Room 123');
  });
});
