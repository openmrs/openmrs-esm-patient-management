import React from 'react';
import { render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import QueueDuration from './queue-duration.component';

describe('QueueDuration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T12:00:00'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('displays positive wait time correctly', () => {
    const startedAt = dayjs().subtract(2, 'hours').subtract(30, 'minutes').toDate();
    render(<QueueDuration startedAt={startedAt} />);
    expect(screen.getByText(/2 hour\(s\) and 30 minute\(s\)/i)).toBeInTheDocument();
  });

  it('displays minutes only when less than an hour', () => {
    const startedAt = dayjs().subtract(45, 'minutes').toDate();
    render(<QueueDuration startedAt={startedAt} />);
    expect(screen.getByText(/45 minute\(s\)/i)).toBeInTheDocument();
  });

  it('displays 0 minutes when startedAt is in the future', () => {
    const startedAt = dayjs().add(2, 'hours').toDate();
    render(<QueueDuration startedAt={startedAt} />);
    expect(screen.getByText(/0 minute\(s\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/-/)).not.toBeInTheDocument();
  });

  it('displays wait time up to endedAt when provided', () => {
    const startedAt = dayjs().subtract(1, 'hour').toDate();
    const endedAt = dayjs().toDate();
    render(<QueueDuration startedAt={startedAt} endedAt={endedAt} />);
    expect(screen.getByText(/1 hour\(s\) and 0 minute\(s\)/i)).toBeInTheDocument();
  });

});
