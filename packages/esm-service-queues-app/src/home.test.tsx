import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from './config-schema';
import { updateSelectedQueueLocationName } from './store/store';
import Home from './home.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
});

describe('Home Component', () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    updateSelectedQueueLocationName('Test Location');
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders PatientQueueHeader, ClinicMetrics when activeTicketScreen is not "screen"', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, pathname: '/some-path' },
    });

    render(<Home />);

    expect(screen.getByTestId('patient-queue-header')).toBeInTheDocument();
  });

  it('renders QueueScreen when activeTicketScreen is "screen"', () => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, pathname: '/some-path/screen' },
    });

    render(<Home />);

    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();
  });
});
