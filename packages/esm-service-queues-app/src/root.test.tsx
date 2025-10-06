import React from 'react';
import { render, screen } from '@testing-library/react';
import Root from './root.component';

jest.mock('./home.component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="home-component">Home Component</div>),
}));

jest.mock('./queue-patient-linelists/queue-services-table.component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="services-table-component">Services Table Component</div>),
}));

jest.mock('./queue-screen/queue-screen.component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="queue-screen-component">Queue Screen Component</div>),
}));

jest.mock('./views/queue-table-by-status-view.component', () => ({
  __esModule: true,
  default: jest.fn(({ queueUuid }) => (
    <div data-testid="queue-table-by-status-component">Queue Table By Status: {queueUuid}</div>
  )),
}));

jest.mock('./admin/admin-page/admin-page.component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="admin-page-component">Admin Page Component</div>),
}));

describe('Root Component', () => {
  beforeEach(() => {
    window.getOpenmrsSpaBase = jest.fn().mockReturnValue('/openmrs/spa/');
  });

  it('renders Home component for "/" route', () => {
    window.history.pushState({}, 'Home', '/openmrs/spa/home/service-queues/');
    render(<Root />);
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });

  it('renders ServicesTable component for "/queue-list/:service/:serviceUuid/:locationUuid" route', () => {
    window.history.pushState(
      {},
      'Queue List',
      '/openmrs/spa/home/service-queues/queue-list/test-service/service-123/location-456',
    );
    render(<Root />);
    expect(screen.getByTestId('services-table-component')).toBeInTheDocument();
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

  it('uses correct basename from getOpenmrsSpaBase', () => {
    window.history.pushState({}, 'Home', '/openmrs/spa/home/service-queues/');
    render(<Root />);
    expect(window.getOpenmrsSpaBase).toHaveBeenCalled();
  });
});
