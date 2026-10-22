import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBedsGroupedByLocation } from './summary.resource';

vi.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: vi.fn(),
  restBaseUrl: '/openmrs/ws/rest/v1',
  useConfig: vi.fn(),
}));

describe('useBedsGroupedByLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears the error and repopulates beds after a successful revalidation', async () => {
    vi.mocked(useConfig).mockReturnValue({
      admissionLocationTagName: 'Admission Location',
    } as any);

    let failBeds = true;
    vi.mocked(openmrsFetch).mockImplementation(async (url: string) => {
      if (url.includes('/location?tag=')) {
        return {
          data: { results: [{ uuid: 'loc-1', display: 'Ward A' }] },
        } as any;
      }

      if (failBeds) {
        throw new Error('boom 500');
      }

      return {
        data: {
          results: [{ id: 1, uuid: 'bed-1', bedNumber: 'B-1', status: 'AVAILABLE' }],
        },
      } as any;
    });

    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        SWRConfig,
        {
          value: {
            provider: () => new Map(),
            dedupingInterval: 0,
          },
        },
        children,
      );

    const { result } = renderHook(() => useBedsGroupedByLocation(), { wrapper });

    await waitFor(() => {
      expect(result.current.errorFetchingBedsGroupedByLocation).toBeTruthy();
    });

    failBeds = false;

    await act(async () => {
      await result.current.mutateBedsGroupedByLocation();
    });

    await waitFor(() => {
      expect(result.current.errorFetchingBedsGroupedByLocation).toBeNull();
    });

    expect(result.current.bedsGroupedByLocation).toHaveLength(1);
    expect(result.current.bedsGroupedByLocation[0][0].bedNumber).toBe('B-1');
  });
});
