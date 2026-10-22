import useSWRImmutable from 'swr/immutable';
import { vi, describe, it, expect, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { restBaseUrl } from '@openmrs/esm-framework';
import { useConceptAnswers } from './field.resource';

vi.mock('swr/immutable', () => ({
  default: vi.fn().mockReturnValue({
    data: undefined,
    error: null,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
  }),
}));

const useSWRImmutableMock = useSWRImmutable as Mock;

describe('useConceptAnswers', () => {
  it('requests a minimal custom representation instead of the default representation', () => {
    renderHook(() => useConceptAnswers('concept-uuid'));

    expect(useSWRImmutableMock).toHaveBeenCalledWith(
      `${restBaseUrl}/concept/concept-uuid?v=custom:(uuid,display,answers:(uuid,display))`,
      expect.any(Function),
    );
  });

  it('does not fetch when conceptUuid is empty', () => {
    renderHook(() => useConceptAnswers(''));

    expect(useSWRImmutableMock).toHaveBeenCalledWith(null, expect.any(Function));
  });
});
