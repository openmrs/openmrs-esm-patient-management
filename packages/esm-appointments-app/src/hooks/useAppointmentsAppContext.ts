import { useAppContext } from '@openmrs/esm-framework';
import { type AppointmentsAppContext, type Appointment } from '../types';

/**
 * This hook provides a way to reuse fetched appointments data throughout the app.
 * It assumes that:
 * - the ScheduledAppointments component, which calls useDefinedAppContext, is mounted.
 * - It is not used in an extension mounted outside the Appointments app, since it relies
 *   on data in useAppointmentsStore().
 */
export function useAppointmentsAppContext() {
  return (
    useAppContext<AppointmentsAppContext>('appointments') ?? {
      appointmentForSelectedDateFilteredByServiceTypes: [] as Appointment[],
      error: null,
      isLoading: true,
    }
  );
}
