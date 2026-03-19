/**
 * Standardized return type for all appointment data hooks.
 * Ensures consistency across the codebase for error handling and loading states.
 */
export interface UseAppointmentHookResult<T> {
  /** The fetched data, defaults to empty array if not loaded */
  data: T;
  /** Whether the data is currently loading */
  isLoading: boolean;
  /** Error object if the fetch failed, null otherwise */
  error: Error | null;
}
