import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig, getDefaultsFromConfigSchema } from '@openmrs/esm-framework';
import Appointments from './appointments.component';
import { type ConfigObject, configSchema } from './config-schema';
import { BrowserRouter } from 'react-router-dom';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

describe('Appointments', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
    });
  });

  it('renders the appointments dashboard', async () => {
    render(
      <BrowserRouter>
        <Appointments />
      </BrowserRouter>,
    );

    expect(screen.getByRole('button', { name: /appointments calendar/i })).toBeInTheDocument();
    expect(screen.getByText(/filter appointments by service type/i)).toBeInTheDocument();
    expect(screen.getByText(/appointments calendar/i)).toBeInTheDocument();
  });
});
