import useSWR from 'swr';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import last from 'lodash-es/last';
import { openmrsFetch, Visit, useSession } from '@openmrs/esm-framework';
import { VisitQueueEntry } from '../active-visits/active-visits-table.resource';

dayjs.extend(isToday);

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

export function useMissingQueueEntries() {
  const currentUserSession = useSession();
  const startDate = dayjs().format('YYYY-MM-DD');
  const sessionLocation = currentUserSession?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)&fromStartDate=' +
    startDate +
    '&location=' +
    sessionLocation;
  const url = `/ws/rest/v1/visit?includeInactive=false&v=${customRepresentation}`;
  const {
    data: visitsData,
    error: visitsError,
    isValidating: visitsIsValidating,
  } = useSWR<{ data: { results: Array<Visit> } }, Error>(sessionLocation ? url : null, openmrsFetch);

  const apiUrl = `/ws/rest/v1/visit-queue-entry`;
  const {
    data: queueData,
    error: queueError,
    isValidating: queueIsValidating,
    mutate: mutateQueueEntries,
  } = useSWR<{ data: { results: Array<VisitQueueEntry> } }, Error>(apiUrl, openmrsFetch);

  const byId = {};
  queueData?.data?.results.forEach((item) => {
    if (item?.queueEntry.patient?.uuid) {
      byId[item?.queueEntry.patient?.uuid] = true;
    }
  });

  const data = visitsData?.data?.results?.filter((item) => {
    if (byId[item?.patient?.uuid]) {
      return false;
    }
    return true;
  });

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

  const formattedActiveVisits = data?.length
    ? data.map(mapVisitProperties).filter(({ visitStartTime }) => dayjs(visitStartTime).isToday())
    : [];

  return {
    activeVisits: formattedActiveVisits,
    isLoading: !data && !visitsError && !queueError,
    isError: !visitsError && !queueError,
    visitsIsValidating,
    mutateQueueEntries,
  };
}

export const getOriginFromPathName = (pathname = '') => {
  const from = pathname.split('/');
  return last(from);
};
