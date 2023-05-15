import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import last from 'lodash-es/last';
import {
  openmrsFetch,
  Visit,
  useSession,
  FetchResponse,
  formatDatetime,
  parseDate,
  useConfig,
} from '@openmrs/esm-framework';
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

interface VisitResponse {
  results: Array<Visit>;
  links: Array<{ rel: 'prev' | 'next' }>;
  totalCount: number;
}

export function useActiveVisits() {
  const session = useSession();
  const config = useConfig();
  const startDate = dayjs().format('YYYY-MM-DD');
  const sessionLocation = session?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid,identifierType:(name,uuid)),person:(age,display,gender,uuid,attributes:(value,attributeType:(uuid,display)))),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,stopDatetime)';

  const getUrl = (pageIndex, previousPageData: FetchResponse<VisitResponse>) => {
    if (pageIndex && !previousPageData?.data?.links?.some((link) => link.rel === 'next')) {
      return null;
    }

    let url = `/ws/rest/v1/visit?includeInactive=false&v=${customRepresentation}&totalCount=true&fromStartDate=${startDate}&location=${sessionLocation}`;

    if (pageIndex) {
      url += `&startIndex=${pageIndex * 50}`;
    }

    return url;
  };

  const {
    data,
    error,
    isLoading,
    isValidating,
    size: pageNumber,
    setSize,
  } = useSWRInfinite<FetchResponse<VisitResponse>, Error>(sessionLocation ? getUrl : null, openmrsFetch);

  useEffect(() => {
    if (data && data?.[pageNumber - 1]?.data?.links?.some((link) => link.rel === 'next')) {
      setSize((currentSize) => currentSize + 1);
    }
  }, [data, pageNumber]);

  const mapVisitProperties = (visit: Visit): ActiveVisit => {
    //create base object
    const activeVisits: ActiveVisit = {
      age: visit?.patient?.person?.age,
      id: visit.uuid,
      idNumber: null,
      gender: visit?.patient?.person?.gender,
      location: visit?.location?.uuid,
      name: visit?.patient?.person?.display,
      patientUuid: visit?.patient?.uuid,
      visitStartTime: formatDatetime(parseDate(visit?.startDatetime)),
      visitType: visit?.visitType?.display,
      visitUuid: visit.uuid,
    };

    //in case no configuration is given the previsous behavior remanes the same
    if (!config?.activeVisits?.identifiers) {
      config.activeVisits.identifiers = [
        {
          header: {
            key: 'idNumber',
            default: 'ID Number',
          },
          identifierName: visit?.patient?.identifiers[0].identifierType?.name,
        },
      ];
    } else {
      //map identifires on config
      config?.activeVisits?.identifiers?.map((configIdentifier) => {
        //check if in the current visit the patient has in his identifiers the current identifierType name
        const visitIdentifier = visit?.patient?.identifiers.find(
          (visitIdentifier) => visitIdentifier?.identifierType?.name === configIdentifier?.identifierName,
        );

        //add the new identifier or rewrite existing one to activeVisit object
        //the parameter will corresponde to the name of the key value of the configuration
        //and the respective value is the visit identifier
        //If there isn't a identifier we display this default text '--'
        activeVisits[configIdentifier.header?.key] = visitIdentifier?.identifier ?? '--';
      });

      //map attributes on config
      config?.activeVisits?.attributes?.map(({ display, header }) => {
        //check if in the current visit the person has in his attributes the current display
        const personAttributes = visit?.patient?.person?.attributes.find(
          (personAttributes) => personAttributes?.attributeType?.display === display,
        );

        //add the new attribute or rewrite existing one to activeVisit object
        //the parameter will corresponde to the name of the key value of the configuration
        //and the respective value is the persons value
        //If there isn't a attribute we display this default text '--'
        activeVisits[header?.key] = personAttributes?.value ?? '--';
      });
    }

    return activeVisits;
  };

  const formattedActiveVisits: Array<ActiveVisit> = data
    ? [].concat(
        ...data?.map(
          (res) => res?.data?.results?.map(mapVisitProperties),
          // ?.filter(({ visitStartTime }) => dayjs(visitStartTime).isToday()),
        ),
      )
    : [];

  return {
    activeVisits: formattedActiveVisits,
    isLoading,
    isValidating,
    isError: error,
    totalResults: data?.[0]?.data?.totalCount ?? 0,
  };
}

export const getOriginFromPathName = (pathname = '') => {
  const from = pathname.split('/');
  return last(from);
};
