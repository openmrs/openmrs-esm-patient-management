import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { type ConfigObject, configSchema } from '../config-schema';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import { useSessionLocationAncestry } from '../hooks/useSessionLocationAncestry';
import {
  getValueFromSessionStorage,
  updateSelectedQueueLocationName,
  updateSelectedQueueLocationUuid,
  updateValueInSessionStorage,
} from '../store/store';
import QueueLocationHeaderTitle from './queue-location-header-title.component';

const LOGIN_LOCATION_STORAGE_KEY = 'queueLoginLocationUuid';
const LOGIN_LOCATION_UUID = 'login-loc';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const mockUseQueueLocations = vi.mocked(useQueueLocations);
const mockUseSessionLocationAncestry = vi.mocked(useSessionLocationAncestry);

vi.mock('../create-queue-entry/hooks/useQueueLocations', () => ({
  useQueueLocations: vi.fn(),
}));

vi.mock('../hooks/useSessionLocationAncestry', () => ({
  useSessionLocationAncestry: vi.fn(),
}));

function mockAncestry(overrides: Partial<ReturnType<typeof useSessionLocationAncestry>> = {}) {
  mockUseSessionLocationAncestry.mockReturnValue({
    ancestry: [],
    isLoading: false,
    error: undefined,
    ...overrides,
  } as ReturnType<typeof useSessionLocationAncestry>);
}

function mockQueueLocations(locations: Array<{ id: string; name: string }>) {
  mockUseQueueLocations.mockReturnValue({
    queueLocations: locations,
    isLoading: false,
    error: null,
  } as ReturnType<typeof useQueueLocations>);
}

describe('QueueLocationHeaderTitle', () => {
  beforeEach(() => {
    sessionStorage.clear();
    // Reset the global store between tests.
    updateSelectedQueueLocationUuid(null);
    updateSelectedQueueLocationName(null);
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema<ConfigObject>(configSchema));
    mockUseSession.mockReturnValue({ sessionLocation: { uuid: LOGIN_LOCATION_UUID } } as ReturnType<typeof useSession>);
  });

  it('defaults to the login location when it is queue-tagged', async () => {
    mockAncestry({ ancestry: [LOGIN_LOCATION_UUID, 'parent'] });
    mockQueueLocations([{ id: LOGIN_LOCATION_UUID, name: 'Login Clinic' }]);

    renderWithSwr(<QueueLocationHeaderTitle />);

    expect(await screen.findByText('Login Clinic')).toBeInTheDocument();
    expect(getValueFromSessionStorage('queueLocationUuid')).toBe(LOGIN_LOCATION_UUID);
    expect(getValueFromSessionStorage(LOGIN_LOCATION_STORAGE_KEY)).toBe(LOGIN_LOCATION_UUID);
  });

  it('falls back to the nearest queue-tagged ancestor when the login location is not tagged', async () => {
    mockAncestry({ ancestry: [LOGIN_LOCATION_UUID, 'parent', 'root'] });
    mockQueueLocations([{ id: 'parent', name: 'Parent Facility' }]);

    renderWithSwr(<QueueLocationHeaderTitle />);

    expect(await screen.findByText('Parent Facility')).toBeInTheDocument();
    expect(getValueFromSessionStorage('queueLocationUuid')).toBe('parent');
  });

  it('defaults to "All" (the dashboard title) when nothing in the ancestry is queue-tagged', async () => {
    mockAncestry({ ancestry: [LOGIN_LOCATION_UUID, 'parent'] });
    mockQueueLocations([{ id: 'unrelated', name: 'Somewhere Else' }]);

    renderWithSwr(<QueueLocationHeaderTitle />);

    await waitFor(() => expect(getValueFromSessionStorage(LOGIN_LOCATION_STORAGE_KEY)).toBe(LOGIN_LOCATION_UUID));
    expect(screen.getByText('Service queues')).toBeInTheDocument();
    expect(getValueFromSessionStorage('queueLocationUuid')).toBeNull();
  });

  it('keeps a manual selection across a reload (does not re-resolve for the same login)', async () => {
    // Simulate a prior session that already resolved for this login and a manual pick.
    updateValueInSessionStorage(LOGIN_LOCATION_STORAGE_KEY, LOGIN_LOCATION_UUID);
    updateSelectedQueueLocationUuid('manual-loc');
    updateSelectedQueueLocationName('Manually Picked');

    mockAncestry({ ancestry: [LOGIN_LOCATION_UUID] });
    mockQueueLocations([{ id: LOGIN_LOCATION_UUID, name: 'Login Clinic' }]);

    renderWithSwr(<QueueLocationHeaderTitle />);

    expect(await screen.findByText('Manually Picked')).toBeInTheDocument();
    expect(getValueFromSessionStorage('queueLocationUuid')).toBe('manual-loc');
  });

  it('does not persist the resolved flag when the ancestry fetch fails, so it can retry', async () => {
    mockAncestry({ ancestry: [], error: new Error('fhir down') });
    mockQueueLocations([{ id: LOGIN_LOCATION_UUID, name: 'Login Clinic' }]);

    renderWithSwr(<QueueLocationHeaderTitle />);

    // The dashboard title renders because nothing resolved...
    expect(await screen.findByText('Service queues')).toBeInTheDocument();
    // ...but the "already resolved" flag must remain unset so a later render retries.
    expect(getValueFromSessionStorage(LOGIN_LOCATION_STORAGE_KEY)).toBeNull();
  });
});
