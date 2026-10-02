import React from 'react';
import { vi, describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import AdminPage from './admin-page.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);

vi.mock('../queue-admin.resource', () => ({
  useQueuesMutable: vi.fn(() => ({ queues: [], isLoading: false, error: undefined })),
  useQueueRooms: vi.fn(() => ({ queueRooms: [], isLoading: false, error: undefined })),
}));

describe('AdminPage', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema<ConfigObject>(configSchema));
  });

  it('renders the service queues page header above the queues and queue rooms', () => {
    render(<AdminPage />);

    expect(screen.getByTestId('patient-queue-header')).toBeInTheDocument();
    expect(screen.getByText('Service Queues Admin')).toBeInTheDocument();
    expect(screen.getByText('ServiceQueuesPictogram')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Queues' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Queue rooms' })).toBeInTheDocument();
  });
});
