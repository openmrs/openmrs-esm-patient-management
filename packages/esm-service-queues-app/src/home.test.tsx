import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from './config-schema';
import Home from './home.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

jest.mock('./helpers/helpers', () => ({
  ...jest.requireActual('./helpers/helpers'),
  useSelectedQueueLocationName: jest.fn(() => 'Test Location'),
}));

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
});

describe('Home Component', () => {
  it('renders PatientQueueHeader, ClinicMetrics when activeTicketScreen is not "screen"', () => {
    // Mock window.location.pathname
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: '/some-path' } as Location;

    render(<Home />);

    // Assert that the expected components are rendered
    expect(screen.getByTestId('patient-queue-header')).toBeInTheDocument();
    expect(screen.getByTestId('clinic-metrics')).toBeInTheDocument();

    // Clean up the mock
    window.location = originalLocation;
  });

  it('renders QueueScreen when activeTicketScreen is "screen"', () => {
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: '/some-path/screen' } as Location;

    render(<Home />);
    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();

    window.location = originalLocation;
  });
});
