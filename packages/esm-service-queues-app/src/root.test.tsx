import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, userHasAccess, useSession } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from './config-schema';
import { clinicAdministratorPrivilege } from './constants';
import Root from './root.component';

vi.mocked(useConfig<ConfigObject>).mockReturnValue(getDefaultsFromConfigSchema(configSchema));

const mockUseSession = vi.mocked(useSession);
const mockUserHasAccess = vi.mocked(userHasAccess);

function givenLoggedInUser() {
  mockUseSession.mockReturnValue({
    authenticated: true,
    sessionId: 'session-1',
    user: { uuid: 'user-1' },
  } as ReturnType<typeof useSession>);
}

vi.mock('./home.component', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="home-component">Home Component</div>),
}));

vi.mock('./queue-screen/queue-screen.component', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="queue-screen-component">Queue Screen Component</div>),
}));

vi.mock('./views/queue-table-by-status-view.component', () => ({
  __esModule: true,
  default: vi.fn(({ queueUuid }) => (
    <div data-testid="queue-table-by-status-component">Queue Table By Status: {queueUuid}</div>
  )),
}));

vi.mock('./admin/admin-page/admin-page.component', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="admin-page-component">Admin Page Component</div>),
}));

vi.mock('./clinic-administrator/clinic-administrator-home.component', () => ({
  __esModule: true,
  default: vi.fn(() => <div data-testid="clinic-administrator-component">Clinic Administrator Component</div>),
}));

describe('Root Component', () => {
  beforeEach(() => {
    window.getOpenmrsSpaBase = vi.fn().mockReturnValue('/openmrs/spa/');
    givenLoggedInUser();
    mockUserHasAccess.mockReturnValue(false);
  });

  it('renders Home component for "/" route', () => {
    window.history.pushState({}, 'Home', '/openmrs/spa/home/service-queues/');
    render(<Root />);
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });

  it('renders QueueTableByStatusView component for "/queue-table-by-status/:queueUuid" route', () => {
    window.history.pushState(
      {},
      'Queue Table By Status',
      '/openmrs/spa/home/service-queues/queue-table-by-status/queue-123',
    );
    render(<Root />);
    expect(screen.getByTestId('queue-table-by-status-component')).toBeInTheDocument();
    expect(screen.getByText(/Queue Table By Status: queue-123/)).toBeInTheDocument();
  });

  it('renders QueueScreen component for "/screen" route', () => {
    window.history.pushState({}, 'Queue Screen', '/openmrs/spa/home/service-queues/screen');
    render(<Root />);
    expect(screen.getByTestId('queue-screen-component')).toBeInTheDocument();
  });

  it('renders AdminPage component for "/admin" route', () => {
    window.history.pushState({}, 'Admin Page', '/openmrs/spa/home/service-queues/admin');
    render(<Root />);
    expect(screen.getByTestId('admin-page-component')).toBeInTheDocument();
  });

  it('renders the clinic administrator screen at "/" for a user holding the privilege', () => {
    mockUserHasAccess.mockReturnValue(true);
    window.history.pushState({}, 'Home', '/openmrs/spa/home/service-queues/');

    render(<Root />);

    expect(screen.getByTestId('clinic-administrator-component')).toBeInTheDocument();
    expect(screen.queryByTestId('home-component')).not.toBeInTheDocument();
  });

  it('renders the standard dashboard at "/" for a user without the privilege', () => {
    mockUserHasAccess.mockReturnValue(false);
    window.history.pushState({}, 'Home', '/openmrs/spa/home/service-queues/');

    render(<Root />);

    expect(screen.getByTestId('home-component')).toBeInTheDocument();
    expect(screen.queryByTestId('clinic-administrator-component')).not.toBeInTheDocument();
  });

  it('keeps the standard dashboard reachable at "/waiting-list" for a clinic administrator', () => {
    mockUserHasAccess.mockReturnValue(true);
    window.history.pushState({}, 'Waiting list', '/openmrs/spa/home/service-queues/waiting-list');

    render(<Root />);

    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });

  it('renders neither screen until the session resolves, so the wrong one never flashes', () => {
    mockUseSession.mockReturnValue({ authenticated: false, sessionId: '' } as ReturnType<typeof useSession>);
    window.history.pushState({}, 'Home', '/openmrs/spa/home/service-queues/');

    render(<Root />);

    expect(screen.queryByTestId('home-component')).not.toBeInTheDocument();
    expect(screen.queryByTestId('clinic-administrator-component')).not.toBeInTheDocument();
  });

  it('uses correct basename from getOpenmrsSpaBase', () => {
    window.history.pushState({}, 'Home', '/openmrs/spa/home/service-queues/');
    render(<Root />);
    expect(window.getOpenmrsSpaBase).toHaveBeenCalled();
  });
});
