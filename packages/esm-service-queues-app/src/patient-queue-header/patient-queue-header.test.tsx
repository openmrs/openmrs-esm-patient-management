import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configSchema, type ConfigObject } from '../config-schema';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import {
  updateSelectedQueueLocationName,
  updateSelectedQueueLocationUuid,
  updateSelectedService,
} from '../store/store';
import PatientQueueHeader from './patient-queue-header.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const mockUseQueueLocations = vi.mocked(useQueueLocations);

vi.mock('../create-queue-entry/hooks/useQueueLocations', () => ({
  useQueueLocations: vi.fn(),
}));

vi.mock('../hooks/useQueues', () => ({
  useQueues: vi.fn(() => ({ queues: [] })),
}));

describe('PatientQueueHeader', () => {
  beforeEach(() => {
    sessionStorage.clear();
    updateSelectedQueueLocationUuid(null);
    updateSelectedQueueLocationName(null);
    updateSelectedService(null, 'All');
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
  });

  it('defaults the location filter to the current session location when it is a queue location', async () => {
    mockUseSession.mockReturnValue({
      sessionLocation: {
        uuid: 'session-location-uuid',
        display: 'Session Location Display',
      },
    } as any);
    mockUseQueueLocations.mockReturnValue({
      queueLocations: [
        { id: 'other-location-uuid', name: 'Other Queue Location' },
        { id: 'session-location-uuid', name: 'Session Queue Location' },
      ] as any,
      isLoading: false,
      error: null,
    });

    render(<PatientQueueHeader showFilters />);

    await waitFor(() => {
      expect(sessionStorage.getItem('queueLocationUuid')).toBe('session-location-uuid');
    });
    expect(sessionStorage.getItem('queueLocationName')).toBe('Session Queue Location');
  });

  it('replaces a stale saved location with the current session location on initial load', async () => {
    updateSelectedQueueLocationUuid('mobile-clinic-uuid');
    updateSelectedQueueLocationName('Mobile Clinic');
    mockUseSession.mockReturnValue({
      sessionLocation: {
        uuid: 'outpatient-clinic-uuid',
        display: 'Outpatient Clinic',
      },
    } as any);
    mockUseQueueLocations.mockReturnValue({
      queueLocations: [
        { id: 'mobile-clinic-uuid', name: 'Mobile Clinic' },
        { id: 'outpatient-clinic-uuid', name: 'Outpatient Clinic' },
      ] as any,
      isLoading: false,
      error: null,
    });

    render(<PatientQueueHeader showFilters />);

    await waitFor(() => {
      expect(sessionStorage.getItem('queueLocationUuid')).toBe('outpatient-clinic-uuid');
    });
    expect(sessionStorage.getItem('queueLocationName')).toBe('Outpatient Clinic');
  });
});
