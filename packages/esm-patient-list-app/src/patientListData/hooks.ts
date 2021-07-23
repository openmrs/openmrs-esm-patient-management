import { useState, useEffect } from 'react';
import { getAllPatientLists } from './api';
import { deviceLocalPatientLists } from './localPatientLists';
import { getPatientListMembers } from './mock';
import { PatientListMember, PATIENT_LIST_TYPE, FetchState, EnrichedCohort } from './types';

const initialData = {
  loading: true,
  data: undefined,
  error: undefined,
};

const loadedData = {
  loading: false,
  data: undefined,
  error: undefined,
};

export function usePatientListData(listTypeFilter?: PATIENT_LIST_TYPE, starredFilter?: boolean, nameFilter?: string) {
  const [data, setData] = useState<FetchState<Array<EnrichedCohort>>>(initialData);

  useEffect(() => {
    const ac = new AbortController();
    setData(initialData);
    getAllPatientLists(listTypeFilter, starredFilter, nameFilter, ac)
      .then((y) =>
        setData({
          ...(loadedData as any),
          data: [...deviceLocalPatientLists, ...y.map((x) => ({ ...x, id: x.uuid, isLocal: false }))],
        }),
      )
      .catch((error) => error?.name !== 'AbortError' && setData({ ...loadedData, error }));
    return () => ac.abort();
  }, [listTypeFilter, starredFilter, nameFilter]);

  return data;
}

export function useSinglePatientListData(listUuid: string) {
  const [data, setData] = useState<FetchState<Array<PatientListMember>>>(initialData);

  useEffect(() => {
    const ac = new AbortController();
    setData(initialData);
    getPatientListMembers(listUuid)
      .then((data) =>
        setData({
          ...(loadedData as any),
          data,
        }),
      )
      .catch((error) => error?.name !== 'AbortError' && setData({ ...loadedData, error }));
    return () => ac.abort();
  }, [listUuid]);

  return data;
}
