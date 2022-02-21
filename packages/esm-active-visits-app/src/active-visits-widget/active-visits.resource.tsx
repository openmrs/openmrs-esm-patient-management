import useSWR from 'swr';
import dayjs from 'dayjs';
import { openmrsFetch, Visit, SessionUser } from '@openmrs/esm-framework';

export interface ActiveVisit {
  age: string;
  id: string;
  idNumber: string;
  gender: string;
  location: string;
  name: string;
  patientUuid: string;
  visitStartTime: string;
  visitType: string;
  visitUuid: string;
}

export function useActiveVisits() {
  const { data: currentUserSession } = useCurrentSession();
  const startDate = dayjs().format('YYYY-MM-DD');
  const sessionLocation = currentUserSession?.data?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)&fromStartDate=' +
    startDate +
    '&location=' +
    sessionLocation;
  const url = `/ws/rest/v1/visit?includeInactive=false&v=${customRepresentation}`;
  const { data, error, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(url, openmrsFetch);

  const mapVisitProperties = (visit: Visit): ActiveVisit => ({
    age: visit?.patient?.person?.age,
    id: visit.uuid,
    idNumber: visit?.patient?.identifiers[0]?.identifier,
    gender: visit?.patient?.person?.gender,
    location: visit?.location?.uuid,
    name: visit?.patient?.person?.display,
    patientUuid: visit?.patient?.uuid,
    visitStartTime: visit?.startDatetime,
    visitType: visit?.visitType?.display,
    visitUuid: visit.uuid,
  });

  const formattedActiveVisits = data?.data?.results.length ? data.data.results.map(mapVisitProperties) : [];

  return {
    activeVisits: formattedActiveVisits,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export function useCurrentSession() {
  const { data, error } = useSWR<{ data: SessionUser }, Error>(`/ws/rest/v1/session`, openmrsFetch);

  return {
    data: data ? data : null,
    isError: error,
  };
}
