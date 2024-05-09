import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './home.component';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';

const mockedUseConfig = useConfig as jest.Mock;

mockedUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  concepts: {
    visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
  },
});

jest.mock('./helpers/helpers', () => ({
  ...jest.requireActual('./helpers/helpers'),
  useSelectedQueueLocationName: jest.fn(() => 'Test Location'),
}));

describe('Home Component', () => {
  it('renders PatientQueueHeader, ClinicMetrics when activeTicketScreen is not "screen"', () => {
    // Mock window.location.pathname
    const originalLocation = window.location;
    delete window.location;
    window.location = { pathname: '/some-path' };

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
    window.location = { pathname: '/some-path/screen' };

    render(<Home />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    window.location = originalLocation;
  });
});
