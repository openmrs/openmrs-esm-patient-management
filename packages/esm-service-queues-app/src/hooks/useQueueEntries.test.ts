import { vi, describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { useQueueEntries } from './useQueueEntries';

const mockUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);
const mockMutate = vi.fn();

describe('useQueueEntries', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockUseOpenmrsFetchAll.mockReturnValue({
      data: [],
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useOpenmrsFetchAll>);
  });

  it('refetches when another app dispatches queue-entry-updated', () => {
    renderHook(() => useQueueEntries({ patient: 'patient-uuid', isEnded: false }));

    act(() => {
      window.dispatchEvent(new CustomEvent('queue-entry-updated'));
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
  });

  it('stops listening for queue-entry-updated after unmount', () => {
    const { unmount } = renderHook(() => useQueueEntries({ patient: 'patient-uuid', isEnded: false }));
    unmount();

    window.dispatchEvent(new CustomEvent('queue-entry-updated'));

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
