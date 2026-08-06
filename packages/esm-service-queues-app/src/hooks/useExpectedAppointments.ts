import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';

// Minimal shape of the appointment-scheduling module's appointment resource — only the fields used here.
export interface ExpectedAppointment {
  uuid: string;
  patient: { uuid: string; name: string };
  service?: { name: string };
  location?: { uuid: string };
  startDateTime: number | null;
  status: string;
}

// Terminal statuses are dropped so the count reflects what is still expected rather than everything that
// was ever booked for the day.
const excludedStatuses = new Set(['cancelled', 'completed', 'missed']);

export function useExpectedAppointments(locationUuid?: string) {
  const startOfDay = dayjs().startOf('day').toISOString();
  const url = `${restBaseUrl}/appointments?forDate=${encodeURIComponent(startOfDay)}`;

  const { data, error, isLoading } = useSWR<{ data: Array<ExpectedAppointment> }, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const appointments = (data?.data ?? [])
    .filter((appointment) => !locationUuid || appointment.location?.uuid === locationUuid)
    .filter((appointment) => !excludedStatuses.has(appointment.status?.toLowerCase()))
    .sort((a, b) => (a.startDateTime ?? 0) - (b.startDateTime ?? 0));

  return { appointments, isLoading, error };
}
