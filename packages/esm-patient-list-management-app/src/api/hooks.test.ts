import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOpenmrsFetchAll } from '@openmrs/esm-framework';
import { usePatientListMembers } from './hooks';
import { type OpenmrsCohortMember } from './types';

const mockUseOpenmrsFetchAll = vi.mocked(useOpenmrsFetchAll);

const members = Array.from(
  { length: 15 },
  (_, index) => ({ uuid: `membership-${index + 1}`, patient: { uuid: `patient-${index + 1}` } }) as OpenmrsCohortMember,
);

describe('usePatientListMembers', () => {
  beforeEach(() => {
    mockUseOpenmrsFetchAll.mockReset();
    mockUseOpenmrsFetchAll.mockReturnValue({
      data: members,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof useOpenmrsFetchAll>);
  });

  it('loads every member of the list, not a single page', () => {
    const { result } = renderHook(() => usePatientListMembers('list-uuid'));

    const url = mockUseOpenmrsFetchAll.mock.calls[0][0] as string;
    expect(url).toContain('/cohortm/cohortmember?cohort=list-uuid');
    expect(url).not.toMatch(/startIndex|limit/);
    expect(result.current.listMembers).toHaveLength(15);
  });

  it('does not fetch until the list is known', () => {
    renderHook(() => usePatientListMembers(undefined));

    expect(mockUseOpenmrsFetchAll).toHaveBeenCalledWith(null);
  });
});
