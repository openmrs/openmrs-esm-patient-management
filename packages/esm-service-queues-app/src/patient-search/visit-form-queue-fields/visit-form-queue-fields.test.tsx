import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import VisitFormQueueFields from './visit-form-queue-fields.component';
import { defineConfigSchema, useLayoutType, useSession } from '@openmrs/esm-framework';
import { configSchema } from '../../config-schema';

defineConfigSchema('@openmrs/esm-service-queues-app', configSchema);

const mockUseLayoutType = useLayoutType as jest.Mock;
mockUseLayoutType.mockReturnValue('small-desktop');

const mockUseSession = useSession as jest.Mock;
mockUseSession.mockReturnValue({ sessionLocation: { uuid: '1' } });

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

describe('VisitFormQueueFields', () => {
  it('renders the form fields and returns the set values', async () => {
    const user = userEvent.setup();
    const setFormFields = jest.fn();
    render(<VisitFormQueueFields setFormFields={setFormFields} />);

    expect(screen.getByLabelText('Select a queue location')).toBeInTheDocument();
    expect(screen.getByLabelText('Select a service')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort weight')).toBeInTheDocument();

    const serviceSelect = screen.getByLabelText('Select a service').closest('select');
    await user.selectOptions(serviceSelect, 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90');

    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();

    expect(setFormFields).toHaveBeenCalledWith({
      queueLocation: '1',
      service: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
      // The status and priority are the defaults that come from the config schema.
      // They are selected even though they are not 'allowed' for the queue.
      status: '51ae5e4d-b72b-4912-bf31-a17efb690aeb',
      priority: 'f4620bfa-3625-4883-bd3f-84c2cce14470',
      sortWeight: 0,
    });
  });
});
