import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { useFhirFetchAll } from '@openmrs/esm-framework';
import { useSessionLocationAncestry } from './useSessionLocationAncestry';

const mockUseFhirFetchAll = vi.mocked(useFhirFetchAll);

describe('useSessionLocationAncestry', () => {
  it('builds the ancestry chain from the location up to the root via partOf', () => {
    mockUseFhirFetchAll.mockReturnValue({
      data: [
        { id: 'child', partOf: { reference: 'Location/parent' } },
        { id: 'parent', partOf: { reference: 'Location/root' } },
        { id: 'root' },
      ] as Array<fhir.Location>,
      isLoading: false,
      error: undefined,
    } as ReturnType<typeof useFhirFetchAll>);

    const { result } = renderHook(() => useSessionLocationAncestry('child'));

    expect(result.current.ancestry).toEqual(['child', 'parent', 'root']);
  });

  it('falls back to the location itself when the server returns no ancestry data', () => {
    mockUseFhirFetchAll.mockReturnValue({
      data: [],
      isLoading: false,
      error: undefined,
    } as ReturnType<typeof useFhirFetchAll>);

    const { result } = renderHook(() => useSessionLocationAncestry('child'));

    expect(result.current.ancestry).toEqual(['child']);
  });

  it('returns an empty chain when no location is provided', () => {
    mockUseFhirFetchAll.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as ReturnType<typeof useFhirFetchAll>);

    const { result } = renderHook(() => useSessionLocationAncestry(undefined));

    expect(result.current.ancestry).toEqual([]);
  });

  it('surfaces the fetch error so callers can avoid persisting a degraded default', () => {
    const error = new Error('boom');
    mockUseFhirFetchAll.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as ReturnType<typeof useFhirFetchAll>);

    const { result } = renderHook(() => useSessionLocationAncestry('child'));

    expect(result.current.error).toBe(error);
    // Still degrades gracefully to the location itself rather than throwing.
    expect(result.current.ancestry).toEqual(['child']);
  });
});
