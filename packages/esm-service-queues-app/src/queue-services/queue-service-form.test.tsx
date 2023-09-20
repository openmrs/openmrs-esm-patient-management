import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import QueueServiceForm from './queue-service-form.component';

jest.mock('@openmrs/esm-framework', () => ({
  useLayoutType: () => 'desktop',
  showNotification: jest.fn(),
  showToast: jest.fn(),
}));

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
  it('should display required error messages when form is submitted with missing fields', async () => {
    render(<QueueServiceForm toggleSearchType={() => {}} closePanel={() => {}} />);

    const submitButton = screen.getByText('Save');

    fireEvent.click(submitButton);

    expect(screen.getByText('Missing queue name')).toBeInTheDocument();
  });

  it('should submit the form when all fields are filled', async () => {
    render(<QueueServiceForm toggleSearchType={() => {}} closePanel={() => {}} />);

    const queueNameInput = screen.getByLabelText('Queue name');
    const serviceSelect = screen.getByLabelText('Select a service type');
    const locationSelect = screen.getByLabelText('Select a location');

    fireEvent.change(queueNameInput, { target: { value: 'Test Queue' } });
    fireEvent.change(serviceSelect, { target: { value: '6f017eb0-b035-4acd-b284-da45f5067502' } });
    fireEvent.change(locationSelect, { target: { value: '34567eb0-b035-4acd-b284-da45f5067502' } });

    expect(queueNameInput).toHaveValue('Test Queue');
    expect(serviceSelect).toHaveValue('6f017eb0-b035-4acd-b284-da45f5067502');
    expect(locationSelect).toHaveValue('34567eb0-b035-4acd-b284-da45f5067502');
  });
});
