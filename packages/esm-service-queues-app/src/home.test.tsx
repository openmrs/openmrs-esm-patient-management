import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig, userHasAccess, useSession } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from './config-schema';
import { useQueueEntries } from './hooks/useQueueEntries';
import { updateSelectedQueueLocationName } from './store/store';
import Home from './home.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);
const mockUserHasAccess = vi.mocked(userHasAccess);

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

// ExtensionSlot renders nothing without registered extensions, so stand the metrics row in for it.
vi.mock('./metrics/metrics-container.component', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="header-metrics">Clinic Metrics</div>),
}));

vi.mock('./clinic-administrator/clinic-overview.component', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="clinic-overview">Clinic Overview</div>),
}));

vi.mocked(useQueueEntries).mockReturnValue({
  queueEntries: [],
  isLoading: false,
  isValidating: false,
  totalCount: 0,
  error: undefined,
  mutate: vi.fn(),
});

function givenConfig(clinicAdministratorScreen: Partial<ConfigObject['clinicAdministratorScreen']> = {}) {
  const defaults = getDefaultsFromConfigSchema<ConfigObject>(configSchema);
  mockUseConfig.mockReturnValue({
    ...defaults,
    visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
    clinicAdministratorScreen: { ...defaults.clinicAdministratorScreen, ...clinicAdministratorScreen },
  });
}

describe('Home Component', () => {
  beforeEach(() => {
    givenConfig();
    mockUseSession.mockReturnValue({
      authenticated: true,
      sessionId: 'session-1',
      user: { uuid: 'user-1' },
    } as ReturnType<typeof useSession>);
    mockUserHasAccess.mockReturnValue(false);
    updateSelectedQueueLocationName('Test Location');
  });

  it('renders the service queues dashboard', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /waiting list/i })).toBeInTheDocument();
    expect(screen.getByRole('search', { name: /search this list/i })).toBeInTheDocument();
    expect(screen.getByRole('table', { name: /queue table/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /clear queue entries/i })).not.toBeInTheDocument();

    const expectedColumnHeaders = [/name/, /priority/, /coming from/, /status/, /queue/, /wait time/, /actions/];

    expectedColumnHeaders.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
  });

  it('shows no tabs at all for a user without access, so their dashboard is unchanged', () => {
    givenConfig({ enabled: true });
    mockUserHasAccess.mockReturnValue(false);

    render(<Home />);

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.queryByTestId('clinic-overview')).not.toBeInTheDocument();
  });

  // A session that has not resolved a user yet must not blank the whole page.
  it('falls back to the standard dashboard when the session carries no user', () => {
    givenConfig({ enabled: true });
    mockUserHasAccess.mockReturnValue(true);
    mockUseSession.mockReturnValue({ authenticated: false } as ReturnType<typeof useSession>);

    render(<Home />);

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByTestId('header-metrics')).toBeInTheDocument();
  });

  it('shows no tabs while the screen is disabled, even for a user with access', () => {
    mockUserHasAccess.mockReturnValue(true);

    render(<Home />);

    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  describe('for a clinic administrator', () => {
    beforeEach(() => {
      givenConfig({ enabled: true });
      mockUserHasAccess.mockReturnValue(true);
    });

    it('opens on the clinic overview, since an administrator wants every queue first', () => {
      render(<Home />);

      expect(screen.getByRole('tab', { name: /clinic overview/i })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('clinic-overview')).toBeInTheDocument();
    });

    it('keeps the standard dashboard reachable on the second tab', async () => {
      const user = userEvent.setup();
      render(<Home />);

      await user.click(screen.getByRole('tab', { name: /waiting list/i }));

      expect(screen.getByRole('table', { name: /queue table/i })).toBeInTheDocument();
    });

    it('leaves the unselected tab unmounted rather than polling behind the one on screen', async () => {
      const user = userEvent.setup();
      render(<Home />);

      expect(screen.queryByRole('table', { name: /queue table/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: /waiting list/i }));

      expect(screen.queryByTestId('clinic-overview')).not.toBeInTheDocument();
    });

    // The overview carries its own clinic totals, so the header's metrics would duplicate them.
    it('shows the header metrics only alongside the waiting list', async () => {
      const user = userEvent.setup();
      render(<Home />);

      expect(screen.queryByTestId('header-metrics')).not.toBeInTheDocument();

      await user.click(screen.getByRole('tab', { name: /waiting list/i }));

      expect(screen.getByTestId('header-metrics')).toBeInTheDocument();
    });
  });
});
