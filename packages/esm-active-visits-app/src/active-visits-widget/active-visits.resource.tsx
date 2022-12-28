import useSWR from 'swr';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import last from 'lodash-es/last';
import { openmrsFetch, Visit, useSession, useConfig } from '@openmrs/esm-framework';

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
  [identifier: string]: string;
}

export function useActiveVisits() {
  const config = useConfig();
  const currentUserSession = useSession();
  const startDate = dayjs().format('YYYY-MM-DD');
  const sessionLocation = currentUserSession?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid,identifierType:(name,uuid)),person:(age,display,gender,uuid)),' +
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

  const mapVisitProperties = (visit: Visit): ActiveVisit => {
    //create base object
    let activeVisits: ActiveVisit = {
      age: visit?.patient?.person?.age,
      id: visit.uuid,
      idNumber: null,
      gender: visit?.patient?.person?.gender,
      location: visit?.location?.uuid,
      name: visit?.patient?.person?.display,
      patientUuid: visit?.patient?.uuid,
      visitStartTime: visit?.startDatetime,
      visitType: visit?.visitType?.display,
      visitUuid: visit.uuid,
    };

    //map identifires on config
    config?.activeVisits?.identifiers?.map((configIdentifier) => {
      //check if in the current visit the patient has in his identifiers the current identifierType name
      const visitIdentifier = visit?.patient?.identifiers.find((visitIdentifier) => {
        if (visitIdentifier?.identifierType?.name === configIdentifier?.identifierName) {
          return true;
        }
        return false;
      });

      if (visitIdentifier) {
        //if we find a visit identifier and its idNumber we rewrite the null value
        if (configIdentifier?.header?.key === 'idNumber') {
          activeVisits.idNumber = visitIdentifier?.identifier;
        }
        //else we add the new identifier to activeVisit object
        //the parameter will conresponde to the name of the key value of the configuration
        //and the respective value is the visit identifier
        else {
          activeVisits = {
            ...activeVisits,
            [configIdentifier?.header?.key]: visitIdentifier?.identifier,
          };
        }
      } else {
        //If there isn't a identifier we display this default text
        activeVisits = {
          ...activeVisits,
          [configIdentifier?.header?.key]: '--',
        };
      }
    });

    return activeVisits;
  };

  const formattedActiveVisits = data?.data?.results.length
    ? data.data.results.map(mapVisitProperties).filter(({ visitStartTime }) => dayjs(visitStartTime).isToday())
    : [];

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
