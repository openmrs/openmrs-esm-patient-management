import React from 'react';
import { vi, describe, it, beforeEach, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { useAddressEntries, useOrderedAddressHierarchyLevels } from './address-hierarchy.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
    {children}
  </SWRConfig>
);

describe('useOrderedAddressHierarchyLevels', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('returns the ordered address fields', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      data: [{ addressField: 'country' }, { addressField: 'stateProvince' }],
    } as unknown as FetchResponse);

    const { result } = renderHook(() => useOrderedAddressHierarchyLevels(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingFieldOrder).toBe(false));
    expect(result.current.orderedFields).toEqual(['country', 'stateProvince']);
    expect(result.current.errorFetchingFieldOrder).toBeFalsy();
  });

  // Regression test: the legacy `.form` endpoint content-negotiates and can answer a browser-style
  // `Accept` header with a 200 response carrying an HTML page. `openmrsFetch` silently drops a body
  // it cannot parse as JSON, which used to leave `orderedFields` undefined with no error set, so
  // the address field component crashed on `orderedFields.map(...)` while rendering.
  it('reports an error and never returns an undefined field order when the response body is not JSON', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: undefined } as unknown as FetchResponse);

    const { result } = renderHook(() => useOrderedAddressHierarchyLevels(), { wrapper });

    await waitFor(() => expect(result.current.errorFetchingFieldOrder).toBeInstanceOf(Error));
    expect(result.current.orderedFields).toEqual([]);
  });
});

describe('useAddressEntries', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockReset();
  });

  it('returns the address entry names', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [{ name: 'Kampala' }] } as unknown as FetchResponse);

    const { result } = renderHook(() => useAddressEntries(true, 'Uganda'), { wrapper });

    await waitFor(() => expect(result.current.isLoadingAddressEntries).toBe(false));
    expect(result.current.entries).toEqual(['Kampala']);
  });

  it('reports an error and never returns undefined entries when the response body is not JSON', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: undefined } as unknown as FetchResponse);

    const { result } = renderHook(() => useAddressEntries(true, 'Uganda'), { wrapper });

    await waitFor(() => expect(result.current.errorFetchingAddressEntries).toBeInstanceOf(Error));
    expect(result.current.entries).toEqual([]);
  });
});
