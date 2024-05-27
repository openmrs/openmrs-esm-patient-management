import { getGlobalStore, toOmrsIsoString } from '@openmrs/esm-framework';
import { createContext, useEffect, useMemo, useState } from 'react';
import { omrsDateFormat } from '../constants';
import { type QueueEntrySearchCriteria } from '../types';

export const initialQueueEntrySearchCriteria: QueueEntrySearchCriteria = {
  patient: null,
  queue: null,
  priority: null,
  status: null,
  location: null,
  service: null,
  queues: null,
  hasVisit: null,
  queueComingFrom: null,
  startedOnOrAfter: null,
  startedOnOrBefore: null,
  endedOnOrAfter: null,
  endedOnOrBefore: null,
};

export function getQueueFilterStore(tableName: string) {
  if (!tableName) {
    throw new Error('tableName is required to create a queue filter store');
  }

  return getGlobalStore<QueueEntrySearchCriteria>(tableName, initialQueueEntrySearchCriteria);
}

export function updateQueueFilterStore(tableName: string, state: Partial<QueueEntrySearchCriteria>) {
  const store = getQueueFilterStore(tableName);
  store.setState((prev) => ({ ...prev, ...state }));
}

export function resetQueueFilterStore(tableName: string) {
  const store = getQueueFilterStore(tableName);
  store.setState(initialQueueEntrySearchCriteria);
}

export function getQueryParamsForSearch(searchCriteria: QueueEntrySearchCriteria) {
  if (!searchCriteria) {
    return new URLSearchParams();
  }
  const searchParams = new URLSearchParams();
  Object.entries(searchCriteria).forEach(
    ([key, value]: [keyof QueueEntrySearchCriteria, QueueEntrySearchCriteria[keyof QueueEntrySearchCriteria]]) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'boolean') {
          searchParams.append(key, value.toString());
        } else if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else if (value instanceof Date) {
          searchParams.append(key, toOmrsIsoString(value));
        } else {
          searchParams.append(key, value);
        }
      }
    },
  );
  return searchParams;
}

export function useQueueFilterStore(tableName: string) {
  const [searchCriteria, setSearchCriteria] = useState<QueueEntrySearchCriteria>(initialQueueEntrySearchCriteria);

  const isFilterApplied = useMemo(() => {
    return Object.values(searchCriteria).some((value) => !!value);
  }, [searchCriteria]);

  useEffect(() => {
    const store = getQueueFilterStore(tableName);
    if (store) {
      store.subscribe((updatedState) => {
        setSearchCriteria(updatedState);
      });
    }
  }, [tableName, setSearchCriteria]);
  return {
    searchCriteria,
    isFilterApplied,
  };
}
