import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import QueueDuration from './queue-duration.component';

// The duration text itself comes from the framework's formatDurationBetween, so these tests match the
// rendered value loosely and only assert the threshold colouring.
describe('QueueDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not colour the wait time when no thresholds are configured', () => {
    const startedAt = dayjs().subtract(5, 'hours').toDate();

    render(<QueueDuration startedAt={startedAt} thresholds={[]} />);

    const waitTime = screen.getByText(/minutes/i);
    expect(waitTime).not.toHaveClass('red');
    expect(waitTime).not.toHaveClass('orange');
  });

  it('does not colour the wait time one minute below the threshold', () => {
    const startedAt = dayjs().subtract(119, 'minutes').toDate();

    render(<QueueDuration startedAt={startedAt} thresholds={[{ waitTimeInMinutes: 120, color: 'red' }]} />);

    expect(screen.getByText(/minutes/i)).not.toHaveClass('red');
  });

  it('colours the wait time as soon as it reaches the threshold exactly', () => {
    const startedAt = dayjs().subtract(120, 'minutes').toDate();

    render(<QueueDuration startedAt={startedAt} thresholds={[{ waitTimeInMinutes: 120, color: 'red' }]} />);

    expect(screen.getByText(/minutes/i)).toHaveClass('red');
  });

  it('applies the highest matching band when multiple thresholds are configured', () => {
    const startedAt = dayjs().subtract(90, 'minutes').toDate();

    render(
      <QueueDuration
        startedAt={startedAt}
        thresholds={[
          { waitTimeInMinutes: 60, color: 'orange' },
          { waitTimeInMinutes: 120, color: 'red' },
        ]}
      />,
    );

    const waitTime = screen.getByText(/minutes/i);
    expect(waitTime).toHaveClass('orange');
    expect(waitTime).not.toHaveClass('red');
  });
});
