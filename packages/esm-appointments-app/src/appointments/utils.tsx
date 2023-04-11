import { useMemo } from 'react';
import { MappedAppointment } from '../types';

/**
 * Returns an array of page sizes for the given data and page size.
 * If the page size is not specified, the default value is 10.
 *
 * @template T The type of the data array.
 * @param {Array<T>} data The data array.
 * @param {number} [pageSize=10] The page size.
 * @returns {Array<number>} An array of page sizes.
 */
export function getPageSizes<T>(data: Array<T>, pageSize: number = 10): Array<number> {
  if (!data) {
    return [];
  }
  const numberOfPages = Math.ceil(data.length / pageSize);
  return Array.from({ length: numberOfPages }, (_, i) => (i + 1) * pageSize);
}

/**
 * Returns a filtered array of appointments based on a search string.
 * If the search string is empty or null, the original appointments array is returned.
 *
 * @param {Array<MappedAppointment>} appointments The array of appointments to search.
 * @param {string} searchString The search string to use for filtering.
 * @returns {Array<MappedAppointment>} The filtered array of appointments.
 */
export function useSearchResults(
  appointments: Array<MappedAppointment>,
  searchString: string,
): Array<MappedAppointment> {
  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const search = searchString.toLowerCase();
      return appointments.filter((appointment) =>
        Object.entries(appointment).some(([header, value]) => {
          if (header === 'patientUuid') {
            return false;
          }
          return `${value}`.toLowerCase().includes(search);
        }),
      );
    }

    return appointments;
  }, [searchString, appointments]);

  return searchResults;
}
