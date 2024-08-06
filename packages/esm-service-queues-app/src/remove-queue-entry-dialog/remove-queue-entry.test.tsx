import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../config-schema';
import { type MappedQueueEntry } from '../types';
import RemoveQueueEntryDialog from './remove-queue-entry.component';

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);

describe('RemoveQueueEntryDialog', () => {
  const queueEntry = {
    queueUuid: 'fa1e98f1-f002-4174-9e55-34d60951e710',
    queueEntryUuid: '712289ab-32c0-430f-87b6-d9c1e4e4686e',
    visitUuid: 'c90386ff-ae85-45cc-8a01-25852099c5ae',
    patientUuid: 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d',
  } as unknown as MappedQueueEntry;

  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
    });
  });

  it('renders dialog content', () => {
    const closeModal = jest.fn();
    render(<RemoveQueueEntryDialog queueEntry={queueEntry} closeModal={closeModal} />);

    expect(screen.getByText('Service queue')).toBeInTheDocument();
    expect(screen.getByText('Remove patient from queue and end active visit?')).toBeInTheDocument();
    expect(screen.getByText(/Ending this visit will remove this patient/i)).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('End visit')).toBeInTheDocument();
  });

  it('calls closeModal when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const closeModal = jest.fn();

    render(<RemoveQueueEntryDialog queueEntry={queueEntry} closeModal={closeModal} />);

    await user.click(screen.getByText('Cancel'));
    expect(closeModal).toHaveBeenCalledTimes(1);
  });
});
