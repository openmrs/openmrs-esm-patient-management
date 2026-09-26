import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
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

  it('counts a long wait in days, and does not pad a shorter one with a zero day', () => {
    render(<QueueDuration startedAt={dayjs().subtract(30, 'hours').toDate()} thresholds={[]} />);
    expect(screen.getByText('1 day, 6 hours, 0 minutes')).toBeInTheDocument();

    render(<QueueDuration startedAt={dayjs().subtract(90, 'minutes').toDate()} thresholds={[]} />);
    expect(screen.getByText('1 hour, 30 minutes')).toBeInTheDocument();
  });

  it('refreshes without a refetch as time passes', () => {
    render(<QueueDuration startedAt={dayjs().subtract(5, 'minutes').toDate()} thresholds={[]} />);
    expect(screen.getByText('5 minutes')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText('6 minutes')).toBeInTheDocument();
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
