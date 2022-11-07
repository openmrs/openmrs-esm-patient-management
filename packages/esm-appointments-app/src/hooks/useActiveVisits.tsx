import useSWR from 'swr';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import last from 'lodash-es/last';
import { openmrsFetch, Visit, useSession } from '@openmrs/esm-framework';

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

export function useActiveVisits() {
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
  const { data, error, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    sessionLocation ? url : null,
    openmrsFetch,
  );

  const formattedActiveVisits = data?.data?.results.length ?? 0;

  return {
    activeVisits: formattedActiveVisits,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export const getOriginFromPathName = (pathname = '') => {
  const from = pathname.split('/');
  return last(from);
};
