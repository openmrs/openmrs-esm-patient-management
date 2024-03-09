import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render, within } from '@testing-library/react';
import { mockServices, mockPriorities, mockStatus, mockSession, mockLocations, mockMappedQueueEntry } from '__mocks__';
import { type ConfigObject, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { updateQueueEntry } from './active-visits-table.resource';
import ChangeStatus from './change-status-dialog.component';

const mockedUseConfig = useConfig as jest.Mock;
const mockShowSnackbar = showSnackbar as jest.Mock;
const mockUpdateQueueEntry = updateQueueEntry as jest.Mock;

jest.mock('./active-visits-table.resource', () => {
  const originalModule = jest.requireActual('./active-visits-table.resource');

  return {
    ...originalModule,
    updateQueueEntry: jest.fn(),
  };
});

jest.mock('../helpers/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({ queues: mockServices }),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
    toOmrsIsoString: jest.fn(),
    toDateObjectStrict: jest.fn(),
    useLocations: jest.fn().mockImplementation(() => mockLocations.data),
    useSession: jest.fn().mockImplementation(() => mockSession.data),
  };
});

describe('Queue entry details', () => {
  beforeEach(() =>
    mockedUseConfig.mockReturnValue({
      concepts: {},
    } as ConfigObject),
  );

  it('should update a queue entry and display toast message', async () => {
    const user = userEvent.setup();

    mockUpdateQueueEntry.mockResolvedValueOnce({ data: mockMappedQueueEntry, status: 201, statusText: 'Updated' });

    renderUpdateQueueEntryDialog();
    expect(screen.getByText(/queue service/i)).toBeInTheDocument();
    expect(screen.getByText(/queue priority/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /move to next service/i }));

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: true,
      kind: 'success',
      title: 'Update entry',
      subtitle: 'Queue Entry Updated Successfully',
    });
  });
  it('should display error message when rest api call to update queue entry fails', async () => {
    const user = userEvent.setup();

    mockUpdateQueueEntry.mockRejectedValue({
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    });

    renderUpdateQueueEntryDialog();

    expect(screen.getByText(/move patient to the next service?/i)).toBeInTheDocument();
    expect(screen.getByText(/queue service/i)).toBeInTheDocument();
    expect(screen.getByText(/queue priority/i)).toBeInTheDocument();
    const queueServiceTypes = screen.getByLabelText('Select a service');

    expect(within(queueServiceTypes).getAllByRole('option')).toHaveLength(2);
    expect(within(queueServiceTypes).getAllByRole('option')[0]).toHaveValue('176052c7-5fd4-4b33-89cc-7bae6848c65a');
    expect(within(queueServiceTypes).getAllByRole('option')[1]).toHaveValue('d80ff12a-06a7-11ed-b939-0242ac120002');

    await user.click(screen.getByRole('button', { name: /move to next service/i }));

    expect(mockShowSnackbar).toHaveBeenCalledWith({
      subtitle: 'Internal Server Error',
      kind: 'error',
      title: 'Error updating queue entry status',
    });
  });
});

const renderUpdateQueueEntryDialog = () => {
  render(<ChangeStatus queueEntry={mockMappedQueueEntry} closeModal={() => false} />);
};
