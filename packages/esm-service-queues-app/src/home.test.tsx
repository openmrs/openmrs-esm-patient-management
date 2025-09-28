import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from './config-schema';
import Home from './home.component';
import { updateSelectedQueueLocationName } from './store/store';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
});

describe('Home Component', () => {
  //this helps us to restore the original window.location after each test
  let originalLocation: Location;
  beforeEach(() => {
    //here we have stored the actuallocation object when we have not mocked it yet
    originalLocation = window.location;
    updateSelectedQueueLocationName('Test Location');
  });
  afterEach(() => {
    //here we have stored the riginal window.location after every test so that we overcome test leakage
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });
  it('renders PatientQueueHeader, ClinicMetrics when activeTicketScreen is not "screen"', () => {
    //here we override the window.location.pathname to simulate a non screen route
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, pathname: '/some-path' },
    });

    //here we are rendering the Home component
    render(<Home />);

    // expecte the header element to be in the document
    expect(screen.getByTestId('patient-queue-header')).toBeInTheDocument();
  });

  it('renders QueueScreen when activeTicketScreen is "screen"', () => {
    //here we use the override window.location.pathname to simulate the screen route
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, pathname: '/some-path/screen' },
    });
    //here we still render the component
    render(<Home />);
    //here the queue message is expected to be in the document
    expect(screen.getByText(/patients currently in queue/i)).toBeInTheDocument();
  });
});
