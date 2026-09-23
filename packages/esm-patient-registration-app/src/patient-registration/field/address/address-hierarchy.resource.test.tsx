import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import {
  useAddressEntries,
  useAddressHierarchy,
  useAddressHierarchyWithParentSearch,
  useOrderedAddressHierarchyLevels,
} from './address-hierarchy.resource';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      dedupingInterval: 0,
      provider: () => new Map(),
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }}>
    {children}
  </SWRConfig>
);

/**
 * What the addresshierarchy module actually answers with, HTTP 200 and all, when one of its
 * legacy `.form` handlers throws: the exception serialized as JSON.
 */
const mockSerializedException = {
  cause: null,
  localizedMessage: 'Cannot invoke "java.util.Map.get(Object)" because "cache" is null',
  message: 'Cannot invoke "java.util.Map.get(Object)" because "cache" is null',
  stackTrace: [
    {
      className: 'org.openmrs.module.addresshierarchy.service.AddressHierarchyServiceImpl',
      fileName: 'AddressHierarchyServiceImpl.java',
      lineNumber: 462,
      methodName: 'getPossibleFullAddresses',
    },
  ],
  suppressed: [],
};

const mockResponse = (data: unknown) => ({ data }) as unknown as FetchResponse;

describe('useOrderedAddressHierarchyLevels', () => {
  it('returns the ordered address fields', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse([{ addressField: 'country' }, { addressField: 'stateProvince' }]));

    const { result } = renderHook(() => useOrderedAddressHierarchyLevels(), { wrapper });

    await waitFor(() => expect(result.current.isLoadingFieldOrder).toBe(false));
    expect(result.current.orderedFields).toEqual(['country', 'stateProvince']);
    expect(result.current.errorFetchingFieldOrder).toBeFalsy();
  });

  it('surfaces a serialized server exception returned with a 200 status as an error', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse(mockSerializedException));

    const { result } = renderHook(() => useOrderedAddressHierarchyLevels(), { wrapper });

    await waitFor(() => expect(result.current.errorFetchingFieldOrder).toBeInstanceOf(Error));
    expect(result.current.errorFetchingFieldOrder.message).toContain('server error');
    expect(result.current.errorFetchingFieldOrder.message).toContain(mockSerializedException.message);
    // The field order must stay usable so that consumers can't crash while rendering.
    expect(result.current.orderedFields).toEqual([]);
  });

  it.each([
    ['an empty body', undefined],
    ['a null body', null],
  ])('surfaces %s returned with a 200 status as an error', async (_, body) => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse(body));

    const { result } = renderHook(() => useOrderedAddressHierarchyLevels(), { wrapper });

    await waitFor(() => expect(result.current.errorFetchingFieldOrder).toBeInstanceOf(Error));
    expect(result.current.errorFetchingFieldOrder.message).toContain('was not an array');
    expect(result.current.orderedFields).toEqual([]);
  });
});

describe('useAddressEntries', () => {
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('returns the names of the address entries', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse([{ name: 'Kampala' }, { name: 'Wakiso' }]));

    const { result } = renderHook(() => useAddressEntries(true, 'Uganda'), { wrapper });

    await waitFor(() => expect(result.current.isLoadingAddressEntries).toBe(false));
    expect(result.current.entries).toEqual(['Kampala', 'Wakiso']);
    expect(result.current.errorFetchingAddressEntries).toBeFalsy();
  });

  it('surfaces a serialized server exception as an error without logging its stack trace', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse(mockSerializedException));

    const { result } = renderHook(() => useAddressEntries(true, 'Uganda'), { wrapper });

    await waitFor(() => expect(result.current.errorFetchingAddressEntries).toBeInstanceOf(Error));
    expect(result.current.entries).toEqual([]);
    expect(consoleError).toHaveBeenCalled();
    expect(result.current.errorFetchingAddressEntries.message).not.toContain('AddressHierarchyServiceImpl.java');
  });

  it('surfaces an empty body returned with a 200 status as an error', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse(undefined));

    const { result } = renderHook(() => useAddressEntries(true, 'Uganda'), { wrapper });

    await waitFor(() => expect(result.current.errorFetchingAddressEntries).toBeInstanceOf(Error));
    expect(result.current.entries).toEqual([]);
  });
});

describe('useAddressHierarchy', () => {
  it('returns the possible full addresses', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse([{ address: 'Uganda | Kampala' }]));

    const { result } = renderHook(() => useAddressHierarchy('Kampala', '|'), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.addresses).toEqual(['Uganda | Kampala']);
    expect(result.current.error).toBeFalsy();
  });

  it('surfaces a serialized server exception as an error and returns no addresses', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse(mockSerializedException));

    const { result } = renderHook(() => useAddressHierarchy('Kampala', '|'), { wrapper });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.addresses).toEqual([]);
  });
});

describe('useAddressHierarchyWithParentSearch', () => {
  it('returns the matching entries', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse([{ name: 'Kampala', uuid: 'entry-uuid' }]));

    const { result } = renderHook(() => useAddressHierarchyWithParentSearch('cityVillage', 'parent-uuid', 'Kam'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.addresses).toEqual([{ name: 'Kampala', uuid: 'entry-uuid' }]);
  });

  it('surfaces a serialized server exception as an error and returns no entries', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockResponse(mockSerializedException));

    const { result } = renderHook(() => useAddressHierarchyWithParentSearch('cityVillage', 'parent-uuid', 'Kam'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.addresses).toEqual([]);
  });
});
