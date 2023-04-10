import { useEffect } from 'react';
import useSWRInfinite from 'swr/infinite';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import last from 'lodash-es/last';
import { openmrsFetch, Visit, useSession, FetchResponse, formatDatetime, parseDate } from '@openmrs/esm-framework';
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

interface VisitResponse {
  results: Array<Visit>;
  links: Array<{ rel: 'prev' | 'next' }>;
  totalCount: number;
}

export function useActiveVisits() {
  const session = useSession();
  const startDate = dayjs().format('YYYY-MM-DD');
  const sessionLocation = session?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),' +
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

  const mapVisitProperties = (visit: Visit): ActiveVisit => ({
    age: visit?.patient?.person?.age,
    id: visit.uuid,
    idNumber: visit?.patient?.identifiers[0]?.identifier,
    gender: visit?.patient?.person?.gender,
    location: visit?.location?.uuid,
    name: visit?.patient?.person?.display,
    patientUuid: visit?.patient?.uuid,
    visitStartTime: formatDatetime(parseDate(visit?.startDatetime)),
    visitType: visit?.visitType?.display,
    visitUuid: visit.uuid,
  });

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
