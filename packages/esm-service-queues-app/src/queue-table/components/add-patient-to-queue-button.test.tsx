import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, launchWorkspace2, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../../config-schema';
import { useServiceQueuesStore } from '../../store/store';
import AddPatientToQueueButton from './add-patient-to-queue-button.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

vi.mock('../../store/store', () => ({
  useServiceQueuesStore: vi.fn(),
}));

const mockUseServiceQueuesStore = vi.mocked(useServiceQueuesStore);

function launchProps() {
  return mockLaunchWorkspace2.mock.calls[0][1] as Record<string, unknown>;
}

describe('AddPatientToQueueButton', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema) });
    mockUseServiceQueuesStore.mockReturnValue({ selectedServiceUuid: 'service-1' } as any);
  });

  it('passes preSearchContent to the search workspace when showCheckedInPatientsBeforeSearch is enabled', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showCheckedInPatientsBeforeSearch: true,
    });
    render(<AddPatientToQueueButton />);
    await user.click(screen.getByRole('button', { name: /add patient to queue/i }));
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      'queue-patient-search-workspace',
      expect.objectContaining({ preSearchContent: expect.any(Function) }),
      expect.anything(),
    );
  });

  it('omits preSearchContent when showCheckedInPatientsBeforeSearch is disabled', async () => {
    const user = userEvent.setup();
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showCheckedInPatientsBeforeSearch: false,
    });
    render(<AddPatientToQueueButton />);
    await user.click(screen.getByRole('button', { name: /add patient to queue/i }));
    expect(mockLaunchWorkspace2).toHaveBeenCalled();
    expect(launchProps()).not.toHaveProperty('preSearchContent');
  });
});
