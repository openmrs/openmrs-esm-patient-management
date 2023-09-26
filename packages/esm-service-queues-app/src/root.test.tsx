import React from 'react';
import { render, screen } from '@testing-library/react';
import Root from './root.component';

describe('Root Component', () => {
  // Mock the pushState function and store the original implementation
  const originalPushState = window.history.pushState;

  // Restore the original pushState after all tests
  afterAll(() => {
    window.history.pushState = originalPushState;
  });

  it('renders AppointmentsTable component for "/appointments-list/:value/" route', () => {
    window.history.pushState({}, 'Appointments List', '/openmrs/spa/home/service-queues/appointments-list/some-value/');
    render(<Root />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders ServicesTable component for "/queue-list/:value/" route', () => {
    window.history.pushState({}, 'Queue List', '/openmrs/spa/home/service-queues/queue-list/some-value/');
    render(<Root />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
