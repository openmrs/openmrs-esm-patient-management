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
  beforeEach(() => {
    updateSelectedQueueLocationName('Test Location');
  });

  it('renders the service queues dashboard', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /patients currently in queue/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /show patients with status/i })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: /search this list/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /queue table/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear queue entries/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/name/, /priority/, /coming from/, /status/, /queue/, /wait time/, /actions/];

    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
  });
});
