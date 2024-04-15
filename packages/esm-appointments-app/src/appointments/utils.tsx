import { useMemo } from 'react';
import { type Appointment } from '../types';

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
 Returns an array of filtered data that contains search string
 @template T
 @param {T[]} data - The array of data to filter
 @param {string} searchString - The string to search for in the data
 @returns {T[]} The filtered array of data
 */
export function useSearchResults<T>(data: T[], searchString: string): T[] {
  const searchResults = useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const search = searchString.toLowerCase();
      return data.filter((appointment) =>
        Object.entries(appointment).some(([header, value]) => {
          if (header === 'patientUuid') {
            return false;
          }
          return `${value}`.toLowerCase().includes(search);
        }),
      );
    }

    return data;
  }, [searchString, data]);

  return searchResults;
}

/**
 * Accepts an array of Appointment and a searchString
 * Returns those Appointments that match the search string based on the following:
 * case-insensitive partial match on patient name
 * case-insensitive partial match on the primary patient identifier
 * case-insensitive exact match on any of the patient identifiers
 * @param {Appointment[]} data - The array of data to filter
 * @param {string} searchString - The string to search for in the data
 * @returns {Appointment[]} The filtered array of data
 */
export function useAppointmentSearchResults(data: Appointment[], searchString: string): Appointment[] {
  return useMemo(() => {
    if (searchString && searchString.trim() !== '') {
      const lowerCaseSearch = searchString.toLowerCase();
      return data.filter((appointment) => {
        if (appointment.patient.name?.toLowerCase()?.includes(lowerCaseSearch)) {
          return true;
        }
        if (appointment.patient.identifier?.toLowerCase()?.includes(lowerCaseSearch)) {
          return true;
        }
        return false;
      });
    }
    return data;
  }, [searchString, data]);
}

export function filterByServiceType(appointmentList: any[], appointmentServiceType: string) {
  return appointmentServiceType
    ? appointmentList.filter(({ service }) => service?.uuid === appointmentServiceType)
    : appointmentList;
}
