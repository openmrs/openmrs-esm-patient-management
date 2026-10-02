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

    const header = screen.getByTestId('patient-queue-header');
    expect(header).toHaveTextContent('Service Queues Admin');
    expect(header).toHaveTextContent('ServiceQueuesPictogram');

    for (const name of ['Queues', 'Queue rooms']) {
      const sectionHeading = screen.getByRole('heading', { name });
      expect(header.compareDocumentPosition(sectionHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});
