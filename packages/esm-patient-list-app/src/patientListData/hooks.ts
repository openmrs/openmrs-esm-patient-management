import { useState, useEffect } from 'react';
import { getAllPatientLists, OpenmrsCohort } from './api';
import { getPatientListMembers } from './mock';
import { PatientListMember, State } from './types';

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

export function usePatientListData(redo: any, ...args: Parameters<typeof getAllPatientLists>) {
  const [data, setData] = useState<State<Array<OpenmrsCohort & { id: string }>>>(initialData);

  useEffect(() => {
    setData(initialData);
    getAllPatientLists(...args)
      .then((y) =>
        setData({
          ...(loadedData as any),
          data: y.map((x) => ({ ...x, id: x.uuid })),
        }),
      )
      .catch((error) => setData({ ...loadedData, error }));
  }, [redo, ...args]);

  return data;
}

export function useSinglePatientListData(redo: any, ...args: Parameters<typeof getPatientListMembers>) {
  const [data, setData] = useState<State<Array<PatientListMember>>>(initialData);

  useEffect(() => {
    setData(initialData);
    getPatientListMembers(...args)
      .then((data) =>
        setData({
          ...(loadedData as any),
          data,
        }),
      )
      .catch((error) => setData({ ...loadedData, error }));
  }, [redo, ...args]);

  return data;
}
