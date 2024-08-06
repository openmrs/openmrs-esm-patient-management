import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { useLayoutType } from '@openmrs/esm-framework';
import QueueServiceForm from './queue-service-form.workspace';

const defaultProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
};

const mockUseLayoutType = jest.mocked(useLayoutType);

jest.mock('./queue-service.resource', () => ({
  useServiceConcepts: () => ({
    queueConcepts: [
      { uuid: '6f017eb0-b035-4acd-b284-da45f5067502', display: 'Concept 1' },
      { uuid: '5f017eb0-b035-4acd-b284-da45f5067502', display: 'Concept 2' },
    ],
  }),
  saveQueue: jest.fn(() => Promise.resolve({ status: 201 })),
}));

jest.mock('../patient-search/hooks/useQueueLocations', () => ({
  useQueueLocations: () => ({
    queueLocations: [
      { id: '34567eb0-b035-4acd-b284-da45f5067502', name: 'Location 1' },
      { id: '12wi7eb0-b035-4acd-b284-da45f5067502', name: 'Location 2' },
    ],
  }),
}));

describe('QueueServiceForm', () => {
  beforeEach(() => {
    mockUseLayoutType.mockReturnValue('tablet');
  });

  it('should display required error messages when form is submitted with missing fields', async () => {
    const user = userEvent.setup();

    render(<QueueServiceForm {...defaultProps} />);

    const submitButton = screen.getByText('Save');
    await user.click(submitButton);
    expect(screen.getByText('Missing queue name')).toBeInTheDocument();
  });

  it('should submit the form when all fields are filled', async () => {
    const user = userEvent.setup();

    render(<QueueServiceForm {...defaultProps} />);

    const queueNameInput = screen.getByLabelText('Queue name');
    const serviceSelect = screen.getByLabelText('Select a service type');
    const locationSelect = screen.getByLabelText('Select a location');

    await user.type(queueNameInput, 'Test Queue');
    await user.selectOptions(serviceSelect, '6f017eb0-b035-4acd-b284-da45f5067502');
    await user.selectOptions(locationSelect, '34567eb0-b035-4acd-b284-da45f5067502');

    expect(queueNameInput).toHaveValue('Test Queue');
    expect(serviceSelect).toHaveValue('6f017eb0-b035-4acd-b284-da45f5067502');
    expect(locationSelect).toHaveValue('34567eb0-b035-4acd-b284-da45f5067502');
  });
});
