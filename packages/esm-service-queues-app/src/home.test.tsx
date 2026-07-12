import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useSession, userHasAccess } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from './config-schema';
import { CLERK_PRIVILEGE, CLINIC_ADMIN_PRIVILEGE, CLINICIAN_PRIVILEGE } from './constants';
import { useQueueEntries } from './hooks/useQueueEntries';
import { useQueueLocations } from './create-queue-entry/hooks/useQueueLocations';
import { updateSelectedQueueLocationName } from './store/store';
import Home from './home.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const mockUserHasAccess = vi.mocked(userHasAccess);
const mockUseQueueLocations = vi.mocked(useQueueLocations);

vi.mock('./hooks/useQueues', () => ({
  useQueues: vi.fn(() => ({ queues: [] })),
}));

vi.mock('./create-queue-entry/hooks/useQueueLocations', () => ({
  useQueueLocations: vi.fn(() => ({ queueLocations: [], isLoading: false, error: undefined })),
}));

vi.mock('./hooks/useQueueEntries', async () => ({
  ...((await vi.importActual('./hooks/useQueueEntries')) as object),
  useQueueEntries: vi.fn(),
}));

vi.mocked(useQueueEntries).mockReturnValue({
  queueEntries: [],
  isLoading: false,
  isValidating: false,
  totalCount: 0,
  error: undefined,
  mutate: vi.fn(),
});

mockUseConfig.mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
  visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
});

const mockSessionWithUser = {
  authenticated: true,
  sessionId: 'session-id',
  user: { uuid: 'user-uuid', privileges: [], roles: [] },
  sessionLocation: { uuid: 'location-uuid', display: 'Test Location' },
};

describe('Home Component', () => {
  beforeEach(() => {
    updateSelectedQueueLocationName('Test Location');
    // Default: a user with none of the service-queues privileges.
    mockUserHasAccess.mockReturnValue(false);
    mockUseSession.mockReturnValue(mockSessionWithUser as ReturnType<typeof useSession>);
    // Two queue locations so the (filtered) location dropdown is distinguishable between views.
    mockUseQueueLocations.mockReturnValue({
      queueLocations: [
        { id: 'location-uuid', name: 'Test Location' },
        { id: 'other-location-uuid', name: 'Other Location' },
      ],
      isLoading: false,
      error: undefined,
    });
  });

  it('renders the standard service queues dashboard for users without service-queues privileges', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /patients currently in queue/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /show patients with status/i })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: /search this list/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /queue table/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear queue entries/i })).not.toBeInTheDocument();
    // The standard view exposes the location filter.
    expect(screen.getByRole('combobox', { name: /select a queue location/i })).toBeInTheDocument();

    const expectedColumnHeaders = [/name/, /priority/, /coming from/, /status/, /queue/, /wait time/, /actions/];

    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
  });

  it('renders the standard dashboard (with location filter) for a clinic administrator', () => {
    mockUserHasAccess.mockImplementation((privilege) => privilege === CLINIC_ADMIN_PRIVILEGE);

    render(<Home />);

    expect(screen.getByRole('table', { name: /queue table/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /select a queue location/i })).toBeInTheDocument();
  });

  it.each([
    ['clerk', CLERK_PRIVILEGE],
    ['clinician', CLINICIAN_PRIVILEGE],
  ])('renders the focused single-location view for a %s (no location filter)', (_label, privilege) => {
    mockUserHasAccess.mockImplementation((required) => required === privilege);

    render(<Home />);

    // Still a queue table, but the location filter is hidden (locked to the session location).
    expect(screen.getByRole('table', { name: /queue table/i })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: /select a queue location/i })).not.toBeInTheDocument();
  });

  it('prefers the standard dashboard when a user is both a clinic administrator and a queue user', () => {
    mockUserHasAccess.mockImplementation(
      (privilege) => privilege === CLINIC_ADMIN_PRIVILEGE || privilege === CLERK_PRIVILEGE,
    );

    render(<Home />);

    expect(screen.getByRole('combobox', { name: /select a queue location/i })).toBeInTheDocument();
  });
});
