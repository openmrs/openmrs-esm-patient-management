import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatDurationBetween } from '@openmrs/esm-framework';
import QueueDuration from './queue-duration.component';

const mockFormatDurationBetween = vi.mocked(formatDurationBetween);

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...(await importOriginal()),
  formatDurationBetween: vi.fn(),
}));

describe('QueueDuration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
    mockFormatDurationBetween.mockReturnValue('2 hours, 30 minutes');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats the elapsed time from startedAt to the current time', () => {
    const startedAt = new Date('2025-01-01T09:30:00Z');
    render(<QueueDuration startedAt={startedAt} />);

    expect(mockFormatDurationBetween).toHaveBeenCalledWith(startedAt, new Date('2025-01-01T12:00:00Z'), {
      largestUnit: 'hour',
      smallestUnit: 'minute',
      formatOptions: { style: 'long', minutesDisplay: 'always' },
    });
    expect(screen.getByText('2 hours, 30 minutes')).toBeInTheDocument();
  });

  it('measures up to endedAt when provided, ignoring the current time', () => {
    const startedAt = new Date('2025-01-01T09:30:00Z');
    const endedAt = new Date('2025-01-01T10:00:00Z');
    render(<QueueDuration startedAt={startedAt} endedAt={endedAt} />);

    expect(mockFormatDurationBetween).toHaveBeenCalledWith(startedAt, endedAt, expect.anything());
  });
});
