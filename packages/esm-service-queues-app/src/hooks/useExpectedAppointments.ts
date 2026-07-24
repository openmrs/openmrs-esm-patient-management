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

export function useExpectedAppointments(locationUuid?: string) {
  const startOfDay = dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
  const url = `${restBaseUrl}/appointments?forDate=${encodeURIComponent(startOfDay)}`;

  const { data, error, isLoading } = useSWR<{ data: Array<ExpectedAppointment> }, Error>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const appointments = (data?.data ?? [])
    .filter((appointment) => !locationUuid || appointment.location?.uuid === locationUuid)
    .sort((a, b) => (a.startDateTime ?? 0) - (b.startDateTime ?? 0));

  return { appointments, isLoading, error };
}
