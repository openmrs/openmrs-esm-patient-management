import { useState, useEffect } from 'react';
import { getAllPatientLists, OpenmrsCohort } from './api';
import { getPatientListMembers } from './mock';
import { PatientListMember, PATIENT_LIST_TYPE, State } from './types';

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

export function usePatientListData(filter?: PATIENT_LIST_TYPE, starred?: boolean, nameFilter?: string) {
  const [data, setData] = useState<State<Array<OpenmrsCohort & { id: string }>>>(initialData);

  useEffect(() => {
    const ac = new AbortController();
    setData(initialData);
    getAllPatientLists(filter, starred, nameFilter, ac)
      .then((y) =>
        setData({
          ...(loadedData as any),
          data: y.map((x) => ({ ...x, id: x.uuid })),
        }),
      )
      .catch((error) => error?.name !== 'AbortError' && setData({ ...loadedData, error }));
    return () => ac.abort();
  }, [filter, starred, nameFilter]);

  return data;
}

export function useSinglePatientListData(listUuid: string) {
  const [data, setData] = useState<State<Array<PatientListMember>>>(initialData);

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
