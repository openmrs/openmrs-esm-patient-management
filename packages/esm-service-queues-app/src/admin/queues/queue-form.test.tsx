import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { showSnackbar, useLayoutType, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { useSWRConfig } from 'swr';
import { saveQueue } from './queue.resource';
import QueueForm from './queue-form.workspace';

jest.mock('swr', () => ({
  useSWRConfig: jest.fn(),
}));

const defaultProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
  launchChildWorkspace: jest.fn(),
};

const mockSaveQueue = jest.mocked(saveQueue);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockMutate = jest.fn();

jest.mock('./queue.resource', () => ({
  useServiceConcepts: () => ({
    queueConcepts: [
      { uuid: '6f017eb0-b035-4acd-b284-da45f5067502', display: 'Concept 1' },
      { uuid: '5f017eb0-b035-4acd-b284-da45f5067502', display: 'Concept 2' },
    ],
  }),
  saveQueue: jest.fn().mockResolvedValue({ status: 201 }),
}));

jest.mock('../../create-queue-entry/hooks/useQueueLocations', () => ({
  useQueueLocations: () => ({
    queueLocations: [
      { id: '34567eb0-b035-4acd-b284-da45f5067502', name: 'Location 1' },
      { id: '12wi7eb0-b035-4acd-b284-da45f5067502', name: 'Location 2' },
    ],
    isLoading: false,
    error: undefined,
  }),
}));

jest.mock('../../hooks/useQueues', () => ({
  useQueues: jest.fn(() => ({ queues: [] })),
}));

describe('QueueForm', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('tablet');
    (useSWRConfig as jest.Mock).mockReturnValue({ mutate: mockMutate });
  });

  it('renders validation errors when form is submitted with missing fields', async () => {
    const user = userEvent.setup();
    render(<QueueForm {...(defaultProps as any)} />);

    const queueNameInput = screen.getByRole('textbox', { name: /queue name/i });
    const serviceTypeSelect = screen.getByRole('combobox', { name: /select a service type/i });
    const locationSelect = screen.getByRole('combobox', { name: /select a location/i });
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(cancelButton).toBeInTheDocument();
    expect(saveButton).toBeInTheDocument();
    expect(queueNameInput).toBeInTheDocument();
    expect(queueNameInput).not.toBeInvalid();
    expect(serviceTypeSelect).toBeInTheDocument();
    expect(serviceTypeSelect).not.toBeInvalid();

    await user.click(saveButton);
    expect(queueNameInput).toBeInvalid();

    await user.type(queueNameInput, 'Test Queue');
    expect(queueNameInput).not.toBeInvalid();
    expect(serviceTypeSelect).toBeInvalid();

    await user.selectOptions(serviceTypeSelect, '6f017eb0-b035-4acd-b284-da45f5067502');
    await user.selectOptions(locationSelect, '34567eb0-b035-4acd-b284-da45f5067502');
    await user.click(saveButton);

    expect(serviceTypeSelect).not.toBeInvalid();
    expect(queueNameInput).not.toBeInvalid();
    expect(locationSelect).not.toBeInvalid();
  });

  it('submits the form when all required fields are filled', async () => {
    const user = userEvent.setup();
    render(<QueueForm {...(defaultProps as any)} />);

    const queueNameInput = screen.getByRole('textbox', { name: /queue name/i });
    const serviceTypeSelect = screen.getByRole('combobox', { name: /select a service type/i });
    const locationSelect = screen.getByRole('combobox', { name: /select a location/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    await user.type(queueNameInput, 'Test Queue');
    await user.selectOptions(serviceTypeSelect, '6f017eb0-b035-4acd-b284-da45f5067502');
    await user.selectOptions(locationSelect, '34567eb0-b035-4acd-b284-da45f5067502');
    await user.click(saveButton);

    expect(mockSaveQueue).toHaveBeenCalledTimes(1);
    expect(mockSaveQueue).toHaveBeenCalledWith(
      'Test Queue',
      '6f017eb0-b035-4acd-b284-da45f5067502',
      '',
      '34567eb0-b035-4acd-b284-da45f5067502',
    );
    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      title: expect.stringMatching(/queue created/i),
      subtitle: 'Test Queue',
    });
  });

  it('renders an error message when the queue creation fails', async () => {
    const user = userEvent.setup();
    mockSaveQueue.mockRejectedValueOnce(new Error('Internal server error'));
    render(<QueueForm {...(defaultProps as any)} />);

    const queueNameInput = screen.getByRole('textbox', { name: /queue name/i });
    const serviceTypeSelect = screen.getByRole('combobox', { name: /select a service type/i });
    const locationSelect = screen.getByRole('combobox', { name: /select a location/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    await user.type(queueNameInput, 'Test Queue');
    await user.selectOptions(serviceTypeSelect, '6f017eb0-b035-4acd-b284-da45f5067502');
    await user.selectOptions(locationSelect, '34567eb0-b035-4acd-b284-da45f5067502');
    await user.click(saveButton);

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      title: expect.stringMatching(/error creating queue/i),
      subtitle: expect.stringMatching(/internal server error/i),
    });
  });

  it('invalidates the correct cache keys with query parameter pattern on successful creation', async () => {
    const user = userEvent.setup();
    render(<QueueForm {...(defaultProps as any)} />);

    const queueNameInput = screen.getByRole('textbox', { name: /queue name/i });
    const serviceTypeSelect = screen.getByRole('combobox', { name: /select a service type/i });
    const locationSelect = screen.getByRole('combobox', { name: /select a location/i });
    const saveButton = screen.getByRole('button', { name: /save/i });

    await user.type(queueNameInput, 'Test Queue');
    await user.selectOptions(serviceTypeSelect, '6f017eb0-b035-4acd-b284-da45f5067502');
    await user.selectOptions(locationSelect, '34567eb0-b035-4acd-b284-da45f5067502');
    await user.click(saveButton);

    expect(mockMutate).toHaveBeenCalledWith(expect.any(Function));
    const mutateCallback = mockMutate.mock.calls[0][0] as (key: unknown) => boolean;

    // Should match queue endpoints with query parameters
    expect(mutateCallback('/ws/rest/v1/queue?status=active')).toBe(true);
    expect(mutateCallback('/ws/rest/v1/queue?v=full')).toBe(true);

    // Should NOT match other endpoints that start with 'queue'
    expect(mutateCallback('/ws/rest/v1/queue-room')).toBe(false);
    expect(mutateCallback('/ws/rest/v1/queue-entry')).toBe(false);
    expect(mutateCallback('/ws/rest/v1/queueroom')).toBe(false);
  });
});
