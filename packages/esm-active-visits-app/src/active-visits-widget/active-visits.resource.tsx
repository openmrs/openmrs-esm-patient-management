import { useEffect, useMemo, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import last from 'lodash-es/last';
import {
  type FetchResponse,
  formatDatetime,
  openmrsFetch,
  type OpenmrsResource,
  parseDate,
  restBaseUrl,
  useConfig,
  useSession,
  type Visit,
} from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type ActiveVisit, type VisitResponse } from '../types';
import { useTranslation } from 'react-i18next';

dayjs.extend(isToday);

export function useActiveVisits() {
  const session = useSession();
  const config = useConfig();
  const sessionLocation = session?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid,identifierType:(name,uuid)),' +
    'person:(age,display,gender,uuid,attributes:(value,attributeType:(uuid,display)))),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,stopDatetime,' +
    'encounters:(encounterDatetime,obs:(uuid,concept:(uuid,display),value)))';

  const getUrl = (pageIndex, previousPageData: FetchResponse<VisitResponse>) => {
    if (pageIndex && !previousPageData?.data?.links?.some((link) => link.rel === 'next')) {
      return null;
    }

    let url = `${restBaseUrl}/visit?v=${customRepresentation}&`;
    let urlSearchParams = new URLSearchParams();

    urlSearchParams.append('includeInactive', 'false');
    urlSearchParams.append('totalCount', 'true');
    urlSearchParams.append('location', `${sessionLocation}`);

    if (pageIndex) {
      urlSearchParams.append('startIndex', `${pageIndex * 50}`);
    }

    return url + urlSearchParams.toString();
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
  }, [data, pageNumber, setSize]);

  const mapVisitProperties = (visit: Visit): ActiveVisit => {
    // create base object
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

    // in case no configuration is given the previous behavior remains the same
    if (!config?.activeVisits?.identifiers) {
      activeVisits.idNumber = visit?.patient?.identifiers[0]?.identifier ?? '--';
    } else {
      // map identifiers on config
      config?.activeVisits?.identifiers?.map((configIdentifier) => {
        // check if in the current visit the patient has in his identifiers the current identifierType name
        const visitIdentifier = visit?.patient?.identifiers.find(
          (visitIdentifier) => visitIdentifier?.identifierType?.name === configIdentifier?.identifierName,
        );

        // add the new identifier or rewrite existing one to activeVisit object
        // the parameter will corresponds to the name of the key value of the configuration
        // and the respective value is the visit identifier
        // If there isn't a identifier we display this default text '--'
        activeVisits[configIdentifier.header?.key] = visitIdentifier?.identifier ?? '--';
      });
    }

    // map attributes on config
    config?.activeVisits?.attributes?.map(({ display, header }) => {
      // check if in the current visit the person has in his attributes the current display
      const personAttributes = visit?.patient?.person?.attributes.find(
        (personAttributes) => personAttributes?.attributeType?.display === display,
      );

      // add the new attribute or rewrite existing one to activeVisit object
      // the parameter will correspond to the name of the key value of the configuration
      // and the respective value is the persons value
      // If there isn't a attribute we display this default text '--'
      activeVisits[header?.key] = personAttributes?.value ?? '--';
    });

    // Add flattened observations
    const allObs = visit.encounters.reduce((accumulator, encounter) => {
      return [...accumulator, ...(encounter.obs || [])];
    }, []);

    activeVisits.observations = allObs.reduce((map, obs) => {
      const key = obs.concept.uuid;
      if (!map[key]) {
        map[key] = [];
      }
      map[key].push({
        value: obs.value,
        uuid: obs.uuid,
      });
      return map;
    }, {});

    return activeVisits;
  };

  const formattedActiveVisits: Array<ActiveVisit> = data
    ? [].concat(...data?.map((res) => res?.data?.results?.map(mapVisitProperties)))
    : [];

  return {
    activeVisits: formattedActiveVisits,
    error,
    isLoading,
    isValidating,
    totalResults: data?.[0]?.data?.totalCount ?? 0,
  };
}

export function useObsConcepts(uuids: Array<string>): {
  obsConcepts: Array<OpenmrsResource> | undefined;
  isLoadingObsConcepts: boolean;
} {
  const fetchConcept = async (uuid: string): Promise<OpenmrsResource | null> => {
    try {
      const response = await openmrsFetch(`${restBaseUrl}/concept/${uuid}?v=custom:(uuid,display)`);
      return response?.data;
    } catch (error) {
      console.error(`Error fetching concept for UUID: ${uuid}`, error);
      return null;
    }
  };

  const { data, isLoading, error } = useSWR(uuids.length > 0 ? ['obs-concepts', uuids] : null, async () => {
    const results = await Promise.all(uuids.map(fetchConcept));
    return results.filter((concept) => concept !== null);
  });

  return useMemo(
    () => ({
      obsConcepts: data ?? [],
      isLoadingObsConcepts: isLoading,
    }),
    [data, isLoading],
  );
}

export function useActiveVisitsSorting(tableRows: Array<any>) {
  const [sortParams, setSortParams] = useState<{
    key: string;
    sortDirection: 'ASC' | 'DESC' | 'NONE';
  }>({ key: 'visitStartTime', sortDirection: 'DESC' });

  const sortRow = (cellA, cellB, { key, sortDirection }) => {
    setSortParams({ key, sortDirection });
  };

  const getSortValue = (item: any, key: string) => {
    // For observation columns
    if (key.startsWith('obs-')) {
      const conceptUuid = key.replace('obs-', '');
      const obsValue = item?.observations?.[conceptUuid]?.[0]?.value;

      if (!obsValue) return null;
      if (typeof obsValue === 'object' && obsValue.display) {
        return obsValue.display.toLowerCase();
      }
      return obsValue;
    }

    const value = item[key];
    if (value == null) return null;

    if (key === 'visitStartTime') {
      return new Date(value).getTime();
    }

    if (key === 'age' && !isNaN(value)) {
      return Number(value);
    }

    return String(value).toLowerCase();
  };

  const sortedRows = useMemo(() => {
    if (sortParams.sortDirection === 'NONE') {
      return tableRows;
    }

    return [...tableRows].sort((a, b) => {
      const valueA = getSortValue(a, sortParams.key);
      const valueB = getSortValue(b, sortParams.key);

      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return 1;
      if (valueB === null) return -1;

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return sortParams.sortDirection === 'DESC' ? valueB - valueA : valueA - valueB;
      }

      const compareResult = String(valueA).localeCompare(String(valueB), undefined, {
        numeric: true,
      });

      return sortParams.sortDirection === 'DESC' ? -compareResult : compareResult;
    });
  }, [sortParams, tableRows]);

  return {
    sortedRows,
    sortRow,
  };
}

export function useTableHeaders(obsConcepts: OpenmrsResource[]) {
  const { t } = useTranslation();
  const config = useConfig();
  return useMemo(() => {
    let headersIndex = 0;

    const headers = [
      {
        id: headersIndex++,
        header: t('visitStartTime', 'Visit Time'),
        key: 'visitStartTime',
      },
    ];

    config?.activeVisits?.identifiers?.forEach((identifier) => {
      headers.push({
        id: headersIndex++,
        header: t(identifier?.header?.key, identifier?.header?.default),
        key: identifier?.header?.key,
      });
    });

    if (!config?.activeVisits?.identifiers) {
      headers.push({
        id: headersIndex++,
        header: t('idNumber', 'ID Number'),
        key: 'idNumber',
      });
    }

    config?.activeVisits?.attributes?.forEach((attribute) => {
      headers.push({
        id: headersIndex++,
        header: t(attribute?.header?.key, attribute?.header?.default),
        key: attribute?.header?.key,
      });
    });

    // Add headers for obs concepts
    obsConcepts?.forEach((concept) => {
      headers.push({
        id: headersIndex++,
        header: concept.display,
        key: `obs-${concept.uuid}`,
      });
    });

    headers.push(
      {
        id: headersIndex++,
        header: t('name', 'Name'),
        key: 'name',
      },
      {
        id: headersIndex++,
        header: t('gender', 'Gender'),
        key: 'gender',
      },
      {
        id: headersIndex++,
        header: t('age', 'Age'),
        key: 'age',
      },
      {
        id: headersIndex++,
        header: t('visitType', 'Visit Type'),
        key: 'visitType',
      },
    );

    return headers;
  }, [t, config, obsConcepts]);
}

export const getOriginFromPathName = (pathname = '') => {
  const from = pathname.split('/');
  return last(from);
};
