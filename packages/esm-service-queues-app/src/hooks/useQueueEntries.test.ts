import { act, renderHook } from '@testing-library/react';
import range from 'lodash-es/range';
import { useQueueEntries } from './useQueueEntries';
import useSWR from 'swr';

jest.mock('swr');

const mockedUseSWR = useSWR as jest.Mock;

const mockQueueEntries = range(13).map((index) => ({
  uuid: `queue-entry-${index}`,
  priorityComment: 'low',
  queue: {
    uuid: `queue-${index % 3}`,
  },
}));

function getSWRResults(
  mockQueueEntries,
  page: number,
  isLoading: boolean = false,
  isValidating: boolean = false,
  error: Error = undefined,
) {
  const from = page * 4;
  const to = Math.min(from + 4, mockQueueEntries.length);
  const links =
    to < mockQueueEntries.length
      ? [
          {
            rel: 'next',
            uri: `http://localhost:8080/openmrs/ws/rest/v1/queue-entry?page=${page + 1}`,
          },
        ]
      : undefined;
  return {
    data: {
      data: {
        totalCount: mockQueueEntries.length,
        results: mockQueueEntries.slice(from, to),
        links,
      },
    },
    isLoading,
    isValidating,
    error,
  };
}

function getMockUseSWRFunction(
  mockQueueEntries,
  isLoading: boolean = false,
  isValidating: boolean = false,
  error: Error = undefined,
) {
  return (url) => {
    if (url == null) {
      return {
        data: undefined,
        isLoading,
        isValidating,
        error,
      };
    }
    if (typeof url === 'string') {
      const params = new URLSearchParams(url.split('?')[1]);
      if (!params.has('page')) {
        return getSWRResults(mockQueueEntries, 0);
      } else {
        const page = parseInt(params.get('page'));
        return getSWRResults(mockQueueEntries, page);
      }
    } else {
      throw Error('Mock useSWR only supports string urls. Received: ' + url);
    }
  };
}

describe('useQueueEntries', () => {
  beforeEach(() => {
    mockedUseSWR.mockImplementation(getMockUseSWRFunction(mockQueueEntries));
  });

  it('downloads all data', () => {
    const { result } = renderHook(() => useQueueEntries());
    expect(result.current.queueEntries).toHaveLength(13);
  });

  it('refetches when mutate is called', async () => {
    const { result, rerender } = renderHook(() => useQueueEntries());
    expect(result.current.queueEntries).toHaveLength(13);

    // Here we emulate the somewhat bizarre series of returns from useSWR after a mutate.
    // The first return has the stale data with `isValidating` set to false.
    // The second return has the stale data with `isValidating` set to true.
    // The third return has the new data with `isValidating` set to false.
    mockedUseSWR.mockImplementationOnce(getMockUseSWRFunction(mockQueueEntries, false, false));
    await act(() => result.current.mutate());
    mockedUseSWR.mockImplementationOnce(getMockUseSWRFunction(mockQueueEntries, false, true));
    rerender();
    const updatedEntries = [...mockQueueEntries].splice(6);
    updatedEntries[4].priorityComment = 'high';
    mockedUseSWR.mockImplementation(getMockUseSWRFunction(updatedEntries, false, false));
    rerender();
    expect(result.current.queueEntries).toHaveLength(7);
    expect(result.current.queueEntries[4].priorityComment).toBe('high');
  });
});
