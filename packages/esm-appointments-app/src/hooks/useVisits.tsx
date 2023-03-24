import useSWR from 'swr';
import { openmrsFetch, useSession, Visit } from '@openmrs/esm-framework';
import { useAppointmentDate } from '../helpers';
import dayjs from 'dayjs';
const defaultRepresentation = `v=custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,stopDatetime)`;

export const useVisits = () => {
  const startDateTime = useAppointmentDate();
  const session = useSession();
  const visitsUrl = `/ws/rest/v1/visit?includeInactive=false&${defaultRepresentation}&fromStartDate=${dayjs(
    startDateTime,
  ).format('YYYY-MM-DD')}&location=${session?.sessionLocation?.uuid}`;
  const { data, error, isLoading } = useSWR<{ data: { results: Array<Visit> } }>(visitsUrl, openmrsFetch);
  return { isLoading, visits: data?.data?.results ?? [], error };
};
