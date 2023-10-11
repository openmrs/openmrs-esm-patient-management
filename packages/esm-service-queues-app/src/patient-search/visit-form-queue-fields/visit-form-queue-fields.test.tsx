import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import StartVisitQueueFields from './visit-form-queue-fields.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useLayoutType: () => 'desktop',
  showNotification: jest.fn(),
  showToast: jest.fn(),
  useConfig: jest.fn(() => ({
    concepts: {
      defaultStatusConceptUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
    },
    visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
  })),
}));
jest.mock('../hooks/useQueueLocations', () => ({
  useQueueLocations: jest.fn(() => ({
    queueLocations: [{ id: '1', name: 'Location 1' }],
  })),
}));

jest.mock('../../active-visits/active-visits-table.resource', () => ({
  usePriority: jest.fn(() => ({
    priorities: [{ uuid: '197852c7-5fd4-4b33-89cc-7bae6848c65a', display: 'High' }],
  })),
  useStatus: jest.fn(() => ({
    statuses: [{ uuid: '176052c7-5fd4-4b33-89cc-7bae6848c65a', display: 'In Progress' }],
  })),
}));

jest.mock('../../patient-queue-metrics/queue-metrics.resource', () => ({
  useServices: jest.fn((selectedQueueLocation) => ({
    allServices: [{ uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90', name: 'Service 1' }],
    isLoading: false,
  })),
}));

describe('StartVisitQueueFields', () => {
  it('renders the form fields', () => {
    const { getByLabelText, getByText } = render(<StartVisitQueueFields />);

    expect(getByLabelText('Select a queue location')).toBeInTheDocument();
    expect(getByLabelText('Select a service')).toBeInTheDocument();
    expect(getByLabelText('Select a status')).toBeInTheDocument();
    expect(getByText('High')).toBeInTheDocument();
    expect(getByLabelText('Sort weight')).toBeInTheDocument();
  });

  it('updates the selected queue location', () => {
    const { getByLabelText } = render(<StartVisitQueueFields />);

    const selectQueueLocation = getByLabelText('Select a queue location') as HTMLInputElement;
    fireEvent.change(selectQueueLocation, { target: { value: '1' } });

    expect(selectQueueLocation.value).toBe('1');
  });

  it('updates the selected service', () => {
    const { getByLabelText } = render(<StartVisitQueueFields />);

    const selectService = getByLabelText('Select a service') as HTMLInputElement;
    fireEvent.change(selectService, { target: { value: 'service-1' } });

    expect(selectService.value).toBe('e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90');
  });
});
