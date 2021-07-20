import { useState, useEffect } from 'react';
import { getAllPatientLists, OpenmrsCohort } from './api';
import { getPatientListMembers } from './mock';
import { PatientListMember, State } from './types';

export function usePatientListData(redo: any, ...args: Parameters<typeof getAllPatientLists>) {
  const [data, setData] = useState<State<Array<OpenmrsCohort & { id: string }>>>({
    loading: true,
    data: undefined,
    error: undefined,
  });

  useEffect(() => {
    setData({
      loading: true,
      data: undefined,
      error: undefined,
    });
    getAllPatientLists(...args)
      .then((y) => {
        setData({
          loading: false,
          data: y.map((x) => ({ ...x, id: x.uuid })),
          error: undefined,
        });
      })
      .catch((err) => setData({ loading: false, data: undefined, error: err }));
  }, [redo, ...args]);

  return data;
}

export function useSinglePatientListData(redo: any, ...args: Parameters<typeof getPatientListMembers>) {
  const [data, setData] = useState<State<Array<PatientListMember>>>({
    loading: true,
    data: undefined,
    error: undefined,
  });

  useEffect(() => {
    setData({
      loading: true,
      data: undefined,
      error: undefined,
    });
    getPatientListMembers(...args)
      .then((data) => {
        setData({
          loading: false,
          data,
          error: undefined,
        });
      })
      .catch((err) => setData({ loading: false, data: undefined, error: err }));
  }, [redo, ...args]);

  return data;
}
