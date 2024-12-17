/* eslint-disable testing-library/no-node-access */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  useConfig,
  useLayoutType,
  useSession,
  type Visit,
} from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../../config-schema';
import { mockSession, mockVisitAlice } from '__mocks__';
import QueueFields from './queue-fields.component';
import { postQueueEntry } from './queue-fields.resource';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockUseSession = jest.mocked(useSession);

jest.mock('../hooks/useQueueLocations', () => ({
  useQueueLocations: jest.fn(() => ({
    queueLocations: [{ id: '1', name: 'Location 1' }],
  })),
}));

jest.mock('../../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({
      queues: [
        {
          uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
          name: 'Service 1',
          allowedPriorities: [{ uuid: '197852c7-5fd4-4b33-89cc-7bae6848c65a', display: 'High' }],
          allowedStatuses: [{ uuid: '176052c7-5fd4-4b33-89cc-7bae6848c65a', display: 'In Progress' }],
        },
      ],
    }),
  };
});

jest.mock('./queue-fields.resource', () => {
  return {
    postQueueEntry: jest.fn(),
  };
});
const mockPostQueueEntry = jest.mocked(postQueueEntry).mockResolvedValue({} as FetchResponse);

describe('QueueFields', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockUseSession.mockReturnValue(mockSession.data);
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
    });
  });

  it('renders the form fields and returns the set values', async () => {
    const user = userEvent.setup();
    let onSubmit: (visit: Visit) => Promise<any> = null;
    const setOnSubmit = (callback) => {
      onSubmit = callback;
    };
    render(<QueueFields setOnSubmit={setOnSubmit} />);

    expect(screen.getByLabelText('Select a queue location')).toBeInTheDocument();
    expect(screen.getByLabelText('Select a service')).toBeInTheDocument();

    const queueUuid = 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90';
    const serviceSelect = screen.getByLabelText('Select a service').closest('select');
    await user.selectOptions(serviceSelect, queueUuid);

    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    await onSubmit(mockVisitAlice);
    expect(mockPostQueueEntry).toHaveBeenCalledWith(
      mockVisitAlice.uuid,
      queueUuid, // queueUuid
      mockVisitAlice.patient.uuid,
      'f4620bfa-3625-4883-bd3f-84c2cce14470', // priority
      '51ae5e4d-b72b-4912-bf31-a17efb690aeb', // status
      0, // sortWeight
      '1', // locationUuid
      null, // visitQueueNumberAttributeUuid
    );
  });
});
