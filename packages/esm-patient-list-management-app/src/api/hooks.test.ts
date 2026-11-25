import { createElement, type PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openmrsFetch } from '@openmrs/esm-framework';
import { usePatientListMembers } from './hooks';

const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const createMembers = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    uuid: `membership-${index + 1}`,
    patient: { uuid: `patient-${index + 1}` },
  }));

let members = createMembers(0);
let failLaterPages = false;
let maxResultsAbsolute = 100;

const parseUrl = (url: string) => new URL(url, 'https://emr.example.org');

function setup() {
  const cache = new Map();
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      SWRConfig,
      { value: { provider: () => cache, dedupingInterval: 0, shouldRetryOnError: false } },
      children,
    );
  return (listUuid: string | undefined = 'list-uuid') => renderHook(() => usePatientListMembers(listUuid), { wrapper });
}

describe('usePatientListMembers', () => {
  beforeEach(() => {
    members = createMembers(150);
    failLaterPages = false;
    maxResultsAbsolute = 100;
    mockOpenmrsFetch.mockReset();
    // Page the members like the server does: 50 per page by default, rejecting a limit above its maximum.
    mockOpenmrsFetch.mockImplementation((url: string) => {
      const params = parseUrl(url).searchParams;
      const start = Number(params.get('startIndex') ?? 0);
      const limit = Number(params.get('limit') ?? 50);
      if (limit > maxResultsAbsolute) {
        return Promise.reject(new Error(`Administrator has set absolute limit at ${maxResultsAbsolute}`));
      }
      if (start > 0 && failLaterPages) {
        return Promise.reject(new Error('Later page failed'));
      }
      const links =
        start + limit < members.length
          ? [
              {
                rel: 'next',
                uri: `https://backend.example.org${parseUrl(url).pathname}?cohort=list-uuid&limit=${limit}&startIndex=${start + limit}`,
              },
            ]
          : [];
      return Promise.resolve({ data: { results: members.slice(start, start + limit), links } } as Awaited<
        ReturnType<typeof openmrsFetch>
      >);
    });
  });

  it('loads every member, requesting each page once', async () => {
    const { result } = setup()();

    await waitFor(() => expect(result.current.listMembers).toHaveLength(150));

    const params = mockOpenmrsFetch.mock.calls.map(([url]) => parseUrl(url as string).searchParams);
    expect(params.map((p) => p.get('startIndex'))).toEqual([null, '50', '100']);
    expect(params.every((p) => p.get('cohort') === 'list-uuid')).toBe(true);
  });

  it('loads the members when the server allows fewer than 100 results per page', async () => {
    maxResultsAbsolute = 50;
    const { result } = setup()();

    await waitFor(() => expect(result.current.listMembers).toHaveLength(150));
  });

  it('does not fetch until the list is known', () => {
    const mount = setup();
    mount('');

    expect(mockOpenmrsFetch).not.toHaveBeenCalled();
  });

  it('shows members added to a later page when the list is opened again', async () => {
    const mount = setup();
    const first = mount();
    await waitFor(() => expect(first.result.current.listMembers).toHaveLength(150));
    first.unmount();

    members = createMembers(151);
    const second = mount();

    await waitFor(() => expect(second.result.current.listMembers).toHaveLength(151));
  });

  it('reloads every page when the members are mutated', async () => {
    const { result } = setup()();
    await waitFor(() => expect(result.current.listMembers).toHaveLength(150));

    members = createMembers(149);
    await act(async () => {
      await result.current.mutateListMembers();
    });

    expect(result.current.listMembers).toHaveLength(149);
  });

  it('returns an error in the response body of a later page', async () => {
    const error = { message: 'Server error' };
    const servePage = mockOpenmrsFetch.getMockImplementation();
    mockOpenmrsFetch.mockImplementation((url: string) =>
      url.includes('startIndex=')
        ? Promise.resolve({ data: { results: [], error } } as unknown as Awaited<ReturnType<typeof openmrsFetch>>)
        : servePage(url),
    );
    const { result } = setup()();

    await waitFor(() => expect(result.current.error).toBe(error));

    expect(result.current.listMembers).toEqual([]);
  });

  it('stops loading and returns the error when a later page fails', async () => {
    failLaterPages = true;
    const { result } = setup()();

    await waitFor(() => expect(result.current.error).toEqual(new Error('Later page failed')));

    expect(result.current.isLoadingListMembers).toBe(false);
    expect(result.current.listMembers).toEqual([]);
  });
});
