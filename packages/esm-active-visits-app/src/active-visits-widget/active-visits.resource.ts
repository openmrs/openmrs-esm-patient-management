import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { last } from 'lodash-es';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import {
  type FetchResponse,
  type OpenmrsResource,
  type Visit,
  formatDatetime,
  openmrsFetch,
  parseDate,
  restBaseUrl,
  useConfig,
  useSession,
} from '@openmrs/esm-framework';
import { type ActiveVisitsConfigSchema } from '../config-schema';
import { type ActiveVisit, type VisitResponse } from '../types';

dayjs.extend(isToday);
const refreshActiveVisitsEventName = 'openmrs:active-visits-refresh';
const billingRepresentation = 'custom:(uuid,status,dateCreated,patient:(uuid))';

interface BillSummary {
  uuid: string;
  status?: string;
  dateCreated?: string;
  patient?: {
    uuid?: string;
  };
}

interface BillsResponse {
  results: Array<BillSummary>;
}

interface BillingLookupConfig {
  endDate: string;
  lookupKey: string;
  patientUuid: string;
  startDate: string;
}

function getBillingLookupConfig(visit: ActiveVisit): BillingLookupConfig | null {
  if (!visit.patientUuid || !visit.visitStartDatetime) {
    return null;
  }

  const visitStart = dayjs(visit.visitStartDatetime);

  if (!visitStart.isValid()) {
    return null;
  }

  const visitEnd = visit.visitStopDatetime ? dayjs(visit.visitStopDatetime) : visitStart.endOf('day');
  const startDate = visitStart.startOf('day').toISOString();
  const endDate = (visitEnd.isValid() ? visitEnd : visitStart.endOf('day')).endOf('day').toISOString();

  return {
    endDate,
    lookupKey: `${visit.patientUuid}:${startDate}:${endDate}`,
    patientUuid: visit.patientUuid,
    startDate,
  };
}

function getLatestBill(bills: Array<BillSummary>) {
  return bills.reduce<BillSummary | null>((latestBill, currentBill) => {
    if (!currentBill?.uuid) {
      return latestBill;
    }

    if (!latestBill?.dateCreated) {
      return currentBill;
    }

    if (!currentBill.dateCreated) {
      return latestBill;
    }

    return dayjs(currentBill.dateCreated).isAfter(dayjs(latestBill.dateCreated)) ? currentBill : latestBill;
  }, null);
}

/** Bill statuses that mean nothing further is owed for this bill (Kenya cashier / O3 billing). */
function isBillPaidStatus(status?: string) {
  const normalized = (status ?? '').toUpperCase();
  return normalized === 'PAID' || normalized === 'POSTED';
}

/** Most recently created bill that is not fully paid/posted. */
function getLatestUnpaidBill(bills: Array<BillSummary>) {
  const dated = bills.filter((bill) => bill?.uuid);
  if (!dated.length) {
    return null;
  }

  const sorted = [...dated].sort((a, b) => {
    const timeA = a.dateCreated ? dayjs(a.dateCreated).valueOf() : 0;
    const timeB = b.dateCreated ? dayjs(b.dateCreated).valueOf() : 0;
    return timeB - timeA;
  });

  return sorted.find((bill) => !isBillPaidStatus(bill.status)) ?? null;
}

function useActiveVisitBilling(activeVisits: Array<ActiveVisit>) {
  const billingLookups = useMemo(() => {
    const uniqueLookups = new Map<string, BillingLookupConfig>();

    activeVisits.forEach((visit) => {
      const lookup = getBillingLookupConfig(visit);

      if (lookup) {
        uniqueLookups.set(lookup.lookupKey, lookup);
      }
    });

    return Array.from(uniqueLookups.values());
  }, [activeVisits]);

  const {
    data: windowBillingByLookupKey,
    error: windowError,
    isLoading: isLoadingWindow,
    isValidating: isValidatingWindow,
  } = useSWR<Record<string, BillSummary | null>, Error>(
    billingLookups.length ? ['active-visit-billing-window', JSON.stringify(billingLookups)] : null,
    async ([, serializedLookups]) => {
      const parsedLookups = JSON.parse(serializedLookups as string) as Array<BillingLookupConfig>;
      const lookupEntries = await Promise.all(
        parsedLookups.map(async (lookup) => {
          const urlSearchParams = new URLSearchParams({
            createdOnOrAfter: lookup.startDate,
            createdOnOrBefore: lookup.endDate,
            patientUuid: lookup.patientUuid,
            v: billingRepresentation,
          });

          const response = await openmrsFetch<BillsResponse>(
            `${restBaseUrl}/cashier/bill?${urlSearchParams.toString()}`,
          );
          const latestBill = getLatestBill(response?.data?.results ?? []);

          return [lookup.lookupKey, latestBill] as const;
        }),
      );

      return Object.fromEntries(lookupEntries);
    },
  );

  const patientUuidsNeedingFallback = useMemo(() => {
    if (!windowBillingByLookupKey) {
      return [] as Array<string>;
    }

    const uniquePatients = new Set<string>();

    activeVisits.forEach((visit) => {
      const lookup = getBillingLookupConfig(visit);

      if (!lookup || !visit.patientUuid) {
        return;
      }

      const windowBill = windowBillingByLookupKey[lookup.lookupKey];

      if (!windowBill) {
        uniquePatients.add(visit.patientUuid);
      }
    });

    return Array.from(uniquePatients).sort();
  }, [activeVisits, windowBillingByLookupKey]);

  const fallbackSerializedKey = patientUuidsNeedingFallback.length > 0 ? patientUuidsNeedingFallback.join(',') : '';

  const {
    data: fallbackBillingByPatientUuid,
    error: fallbackError,
    isLoading: isLoadingFallback,
    isValidating: isValidatingFallback,
  } = useSWR<Record<string, BillSummary | null>, Error>(
    fallbackSerializedKey ? ['active-visit-billing-fallback', fallbackSerializedKey] : null,
    async ([, patientList]) => {
      const patientUuids = (patientList as string).split(',').filter(Boolean);
      const farPast = dayjs().subtract(10, 'year').startOf('day').toISOString();
      const endNow = dayjs().endOf('day').toISOString();

      const entries = await Promise.all(
        patientUuids.map(async (patientUuid) => {
          const urlSearchParams = new URLSearchParams({
            createdOnOrAfter: farPast,
            createdOnOrBefore: endNow,
            limit: '100',
            patientUuid,
            v: billingRepresentation,
          });

          const response = await openmrsFetch<BillsResponse>(
            `${restBaseUrl}/cashier/bill?${urlSearchParams.toString()}`,
          );
          const latestUnpaid = getLatestUnpaidBill(response?.data?.results ?? []);

          return [patientUuid, latestUnpaid] as const;
        }),
      );

      return Object.fromEntries(entries);
    },
  );

  const billingByVisitId = useMemo(() => {
    return activeVisits.reduce<Record<string, Pick<ActiveVisit, 'billUuid' | 'billingStatus'>>>(
      (accumulator, visit) => {
        const lookup = getBillingLookupConfig(visit);
        const windowBill = lookup ? windowBillingByLookupKey?.[lookup.lookupKey] : null;
        const fallbackBill =
          !windowBill && visit.patientUuid ? fallbackBillingByPatientUuid?.[visit.patientUuid] : null;
        const matchedBill = windowBill ?? fallbackBill ?? null;

        accumulator[visit.id] = {
          billingStatus: matchedBill?.status ?? '',
          billUuid: matchedBill?.uuid,
        };

        return accumulator;
      },
      {},
    );
  }, [activeVisits, fallbackBillingByPatientUuid, windowBillingByLookupKey]);

  return {
    billingByVisitId,
    billingError: windowError ?? fallbackError,
    isLoadingBilling: isLoadingWindow || isLoadingFallback,
    isValidatingBilling: isValidatingWindow || isValidatingFallback,
  };
}

export function useActiveVisits() {
  const session = useSession();
  const config = useConfig<ActiveVisitsConfigSchema>();
  const sessionLocation = session?.sessionLocation?.uuid;

  const customRepresentation =
    'custom:(uuid,patient:(uuid,identifiers:(identifier,uuid,identifierType:(name,uuid)),' +
    'person:(age,display,gender,uuid,attributes:(value,attributeType:(uuid,display)))),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,stopDatetime,' +
    'encounters:(encounterDatetime,obs:(uuid,concept:(uuid,display),value)))';

  const getUrl = (pageIndex: number, previousPageData: FetchResponse<VisitResponse>) => {
    if (pageIndex && !previousPageData?.data?.links?.some((link) => link.rel === 'next')) {
      return null;
    }

    let url = `${restBaseUrl}/visit?v=${customRepresentation}&`;
    let urlSearchParams = new URLSearchParams();

    urlSearchParams.append('includeParentLocations', 'true');
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
    mutate,
  } = useSWRInfinite<FetchResponse<VisitResponse>, Error>(sessionLocation ? getUrl : null, openmrsFetch);

  useEffect(() => {
    if (data && data?.[pageNumber - 1]?.data?.links?.some((link) => link.rel === 'next')) {
      setSize((currentSize) => currentSize + 1);
    }
  }, [data, pageNumber, setSize]);

  useEffect(() => {
    const handleRefresh = () => {
      mutate();
    };

    window.addEventListener(refreshActiveVisitsEventName, handleRefresh);
    return () => window.removeEventListener(refreshActiveVisitsEventName, handleRefresh);
  }, [mutate]);

  const mapVisitProperties = useCallback(
    (visit: Visit): ActiveVisit => {
      // create base object
      const age = visit?.patient?.person?.age;
      const activeVisits: ActiveVisit = {
        age: age ? String(age) : null,
        billingStatus: '',
        billUuid: undefined,
        id: visit.uuid,
        idNumber: null,
        gender: visit?.patient?.person?.gender,
        location: visit?.location?.uuid,
        name: visit?.patient?.person?.display,
        patientUuid: visit?.patient?.uuid,
        visitStartDatetime: visit?.startDatetime,
        visitStartTime: formatDatetime(parseDate(visit?.startDatetime)),
        visitStopDatetime: visit?.stopDatetime,
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
    },
    [config],
  );

  const formattedActiveVisits = useMemo(() => {
    if (!data) {
      return [];
    }
    return [].concat(...data.map((res) => res?.data?.results?.map(mapVisitProperties)));
  }, [data, mapVisitProperties]);
  const { billingByVisitId, isLoadingBilling } = useActiveVisitBilling(formattedActiveVisits);

  const activeVisitsWithBilling = useMemo(
    () =>
      formattedActiveVisits.map((visit) => ({
        ...visit,
        ...billingByVisitId[visit.id],
      })),
    [billingByVisitId, formattedActiveVisits],
  );

  return {
    activeVisits: activeVisitsWithBilling,
    error,
    isLoading: isLoading || isLoadingBilling,
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

export function useActiveVisitsSorting(tableRows: Array<ActiveVisit>) {
  const [sortParams, setSortParams] = useState<{
    key: string;
    sortDirection: 'ASC' | 'DESC' | 'NONE';
  }>({ key: 'visitStartTime', sortDirection: 'DESC' });

  const sortRow = (
    cellA: ActiveVisit,
    cellB: ActiveVisit,
    { key, sortDirection }: { key: string; sortDirection: 'ASC' | 'DESC' | 'NONE' },
  ) => {
    setSortParams({ key, sortDirection });
    return 0; // Return value is not used, actual sorting happens in useMemo
  };

  const getSortValue = (item: ActiveVisit, key: string) => {
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

    const value = item[key] as string | undefined;
    if (value == null) return null;

    if (key === 'visitStartTime') {
      return new Date(value).getTime();
    }

    if (key === 'age' && !isNaN(Number(value))) {
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
  const config = useConfig<ActiveVisitsConfigSchema>();

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
      {
        id: headersIndex++,
        header: t('billing', 'Billing'),
        key: 'billingStatus',
      },
    );

    return headers;
  }, [t, config, obsConcepts]);
}

export const getOriginFromPathName = (pathname = '') => {
  const from = pathname.split('/');
  return last(from);
};
