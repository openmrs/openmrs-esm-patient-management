import React from 'react';
import { screen, render, waitFor, within } from '@testing-library/react';
import { mockServices } from '../../__mocks__/active-visits.mock';
import { mockPriorities, mockStatus } from '../../../../__mocks__/metrics.mock';
import { mockSession } from '../../../../__mocks__/session.mock';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { ConfigObject, showToast, useConfig, showNotification } from '@openmrs/esm-framework';
import ChangeStatus from './change-status-dialog.component';
import { mockQueueEntry } from '../../../../__mocks__/queue-entry.mock';
import userEvent from '@testing-library/user-event';
import { updateQueueEntry } from './active-visits-table.resource';

const mockedUseConfig = useConfig as jest.Mock;
const mockShowToast = showToast as jest.Mock;
const mockUpdateQueueEntry = updateQueueEntry as jest.Mock;
const mockShowNotification = showNotification as jest.Mock;

jest.mock('./active-visits-table.resource.ts', () => {
  const originalModule = jest.requireActual('./active-visits-table.resource.ts');

  return {
    ...originalModule,
    useServices: jest.fn().mockReturnValue({ services: mockServices }),
    usePriority: jest.fn().mockReturnValue({ priorities: mockPriorities }),
    useStatus: jest.fn().mockReturnValue({ statuses: mockStatus }),
    updateQueueEntry: jest.fn(),
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

jest.setTimeout(20000);

describe('Queue entry details', () => {
  beforeEach(() =>
    mockedUseConfig.mockReturnValue({
      concepts: {
        priorityConceptSetUuid: '96105db1-abbf-48d2-8a52-a1d561fd8c90',
        serviceConceptSetUuid: '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a',
        statusConceptSetUuid: 'd60ffa60-fca6-4c60-aea9-a79469ae65c7',
      },
    } as ConfigObject),
  );

  it('should update a queue entry and display toast message', async () => {
    const user = userEvent.setup();

    mockUpdateQueueEntry.mockResolvedValueOnce({ data: mockQueueEntry, status: 201, statusText: 'Updated' });

    renderUpdateQueueEntryDialog();
    expect(screen.getByText(/queue service/i)).toBeInTheDocument();
    expect(screen.getByText(/queue priority/i)).toBeInTheDocument();

    await waitFor(() => user.click(screen.getByRole('button', { name: /move to next service/i })));

    expect(mockShowToast).toHaveBeenCalledTimes(1);
    expect(mockShowToast).toHaveBeenCalledWith({
      critical: true,
      kind: 'success',
      title: 'Update entry',
      description: 'Queue Entry Updated Successfully',
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

    await waitFor(() => user.click(screen.getByRole('button', { name: /move to next service/i })));

    expect(mockShowNotification).toHaveBeenCalledWith({
      description: 'Internal Server Error',
      kind: 'error',
      title: 'Error updating queue entry status',
      critical: true,
    });
  });
});

const renderUpdateQueueEntryDialog = () => {
  render(<ChangeStatus queueEntry={mockQueueEntry} closeModal={() => false} />);
};
