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

// Spies on the real formatDuration so we can assert it is never handed a non-finite value.
// Intl.DurationFormat rejects NaN, natively and in the formatjs polyfill the test mocks load.
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
    // Queue <= 3.0.0 divides by zero when entries match the query but none has both timestamps.
    ['when the backend returns NaN', { waitTime: { averageWaitTime: 'NaN' as unknown as number } }],
    ['when the backend returns no value', { waitTime: { averageWaitTime: null as unknown as number } }],
    // Queue <= 3.0.0 returns 0 when no entries match at all; newer versions return null in both cases.
    ['when nothing matches the query', { waitTime: { averageWaitTime: 0 } }],
    // Rounds to 0 minutes, so it is not a value worth showing either.
    ['when the average is under a minute', { waitTime: { averageWaitTime: 0.4 } }],
  ])('renders a dash without formatting a non-finite duration %s', (_scenario, overrides) => {
    mockWaitTime(overrides);

    render(<AverageWaitTimeExtension />);

    expect(screen.getByText('--')).toBeInTheDocument();
    expect(mockFormatDuration).not.toHaveBeenCalled();
  });
});
