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

  it('renders ServicesTable component for "/service-queues/queue-list/:service/:serviceUuid/:locationUuid', () => {
    window.history.pushState(
      {},
      'Queue List',
      '/openmrs/spa/home/service-queues/queue-list/:service/:serviceUuid/:locationUuid',
    );
    render(<Root />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
