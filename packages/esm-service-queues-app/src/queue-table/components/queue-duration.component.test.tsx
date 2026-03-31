import React from 'react';
import { render, screen } from '@testing-library/react';
import QueueDuration from './queue-duration.component';

describe('QueueDuration', () => {
  it('renders a placeholder when startedAt is null or undefined', () => {
    // @ts-ignore: Testing null even if types expect a Date
    render(<QueueDuration startedAt={null} />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('renders correctly with a valid startedAt date', () => {
    const pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 30);
    render(<QueueDuration startedAt={pastDate} />);
    // This ensures it at least renders "minute(s)" text
    expect(screen.getByText(/minute\(s\)/i)).toBeInTheDocument();
  });
});
