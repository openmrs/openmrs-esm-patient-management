import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type Visit } from '@openmrs/esm-framework';
import { type AppointmentStatus } from '../config-schema';
import { omrsDateFormat, visitCustomRepresentation } from '../constants';

export function useVisit(visitUuid?: string) {
  const apiUrl = `${restBaseUrl}/visit/${visitUuid}?v=${visitCustomRepresentation}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: Visit }, Error>(
    visitUuid ? apiUrl : null,
    openmrsFetch,
  );

  return {
    visit: data ? data.data : null,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;

export interface TodaysAppointment {
  uuid: string;
  status: AppointmentStatus;
  startDateTime: number;
  service: { name: string };
  // `name` is null for a provider that is not linked to a person, or whose person has no name.
  providers: Array<{
    uuid: string;
    name: string | null;
    response: 'AWAITING' | 'ACCEPTED' | 'REJECTED' | 'TENTATIVE' | 'CANCELLED';
  }>;
}

export function useTodaysAppointments(patientUuid: string, statuses: Array<AppointmentStatus>) {
  const startDate = dayjs().startOf('day').format(omrsDateFormat);
  const endDate = dayjs().endOf('day').format(omrsDateFormat);

  // The appointments module only exposes search via POST. No statuses to show means there is nothing to fetch.
  const { data, error, isLoading } = useSWR<{ data: Array<TodaysAppointment> }, Error>(
    patientUuid && statuses.length ? [appointmentsSearchUrl, patientUuid, startDate] : null,
    () =>
      openmrsFetch(appointmentsSearchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { patientUuid, startDate, endDate },
      }),
  );

  return {
    // The backend returns these sorted by start time.
    appointments: data?.data?.filter(({ status }) => statuses.includes(status)) ?? [],
    // Whether the patient has any appointment today, including those with statuses not shown.
    hasAppointmentsToday: data?.data?.length > 0,
    error,
    isLoading,
  };
}
