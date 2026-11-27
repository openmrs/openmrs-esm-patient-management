import useSWRImmutable from 'swr/immutable';
import { beforeEach, vi, describe, it, expect, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import { restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { useConcept, useConceptAnswers } from './field.resource';

vi.mock('swr/immutable', () => ({
  default: vi.fn(),
}));

const useSWRImmutableMock = useSWRImmutable as Mock;
const mockShowSnackbar = vi.mocked(showSnackbar);

describe('field.resource', () => {
  beforeEach(() => {
    mockShowSnackbar.mockClear();
    useSWRImmutableMock.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  describe('useConcept', () => {
    it('shows the error snackbar only once across rerenders for the same error', () => {
      const error = new Error('Concept not found');
      useSWRImmutableMock.mockReturnValue({
        data: undefined,
        error,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      });

      const { rerender } = renderHook(() => useConcept('missing-uuid'));
      rerender();
      rerender();

      expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Error',
        subtitle: 'Concept not found',
        kind: 'error',
      });
    });
  });

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

    it('shows the error snackbar only once across rerenders for the same error', () => {
      const error = new Error('Failed to load answers');
      useSWRImmutableMock.mockReturnValue({
        data: undefined,
        error,
        isLoading: false,
        isValidating: false,
        mutate: vi.fn(),
      });

      const { rerender } = renderHook(() => useConceptAnswers('missing-uuid'));
      rerender();
      rerender();

      expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Error',
        subtitle: 'Failed to load answers',
        kind: 'error',
      });
    });
  });
});
