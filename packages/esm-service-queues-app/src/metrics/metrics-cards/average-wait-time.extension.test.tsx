import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { formatDuration, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import type * as EsmFramework from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import { useAverageWaitTime } from '../metrics.resource';
import AverageWaitTimeExtension from './average-wait-time.extension';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseAverageWaitTime = vi.mocked(useAverageWaitTime);
const mockFormatDuration = vi.mocked(formatDuration);

vi.mock('../metrics.resource', () => ({
  useAverageWaitTime: vi.fn(),
}));

// Spies on the real formatDuration so we can assert it is never handed a non-finite value. Node's ICU
// tolerates NaN (it returns "0 minutes"), but Intl.DurationFormat in the browser throws a RangeError.
vi.mock('@openmrs/esm-framework', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof EsmFramework;
  return { ...actual, formatDuration: vi.fn(actual.formatDuration) };
});

function mockWaitTime(overrides: Partial<ReturnType<typeof useAverageWaitTime>>) {
  mockUseAverageWaitTime.mockReturnValue({
    waitTime: null,
    isLoading: false,
    error: undefined,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  } as ReturnType<typeof useAverageWaitTime>);
}

describe('AverageWaitTimeExtension', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema<ConfigObject>(configSchema));
  });

  it('formats the average wait time in hours and minutes, like the wait time column', () => {
    mockWaitTime({ waitTime: { averageWaitTime: 239.25 } });

    render(<AverageWaitTimeExtension />);

    expect(screen.getByText(/avg\. wait time/i)).toBeInTheDocument();
    expect(screen.getByText('3 hours, 59 minutes')).toBeInTheDocument();
  });

  it('always shows minutes, even when the average is a whole number of hours', () => {
    mockWaitTime({ waitTime: { averageWaitTime: 120 } });

    render(<AverageWaitTimeExtension />);

    expect(screen.getByText('2 hours, 0 minutes')).toBeInTheDocument();
  });

  it.each([
    ['while loading', { isLoading: true }],
    ['on error', { error: new Error('failed to fetch the average wait time') }],
    // The queue module divides by zero when no entry has an `endedAt` and returns {"averageWaitTime": "NaN"}.
    ['when the backend returns NaN', { waitTime: { averageWaitTime: 'NaN' as unknown as number } }],
    ['when the backend returns no value', { waitTime: { averageWaitTime: null as unknown as number } }],
    // Newer queue module versions return 0 instead of NaN when nothing matches the query.
    ['when nothing matches the query', { waitTime: { averageWaitTime: 0 } }],
  ])('renders a dash without formatting a non-finite duration %s', (_scenario, overrides) => {
    mockWaitTime(overrides);

    render(<AverageWaitTimeExtension />);

    expect(screen.getByText('--')).toBeInTheDocument();
    expect(mockFormatDuration).not.toHaveBeenCalled();
  });
});
