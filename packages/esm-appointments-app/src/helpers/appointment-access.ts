import { useSession, userHasAccess } from '@openmrs/esm-framework';

/** Appointments 2.x requires this privilege to create, edit, cancel, or change status. */
export const manageAppointmentsPrivilege = 'Manage Appointments';

/**
 * True when the signed-in user may change appointments.
 * `userHasAccess` also returns true for System Developer.
 */
export function useCanManageAppointments() {
  const session = useSession();
  return Boolean(session?.user && userHasAccess(manageAppointmentsPrivilege, session.user));
}
