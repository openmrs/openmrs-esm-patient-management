export * from './mock';
import React from 'react';
import { getAllPatientLists, getPatientListMembers } from './mock';
import setup from './setupMockState';
import { PatientListBase, PatientListMember } from './types';

const setupPromise = setup();

interface LoadingState {
  loading: true;
  data: undefined;
  error: undefined;
}

interface DataState<T> {
  loading: false;
  data: T;
  error: undefined;
}

interface ErrorState {
  loading: false;
  data: undefined;
  error: Error;
}

type State<T> = LoadingState | DataState<T> | ErrorState;

export function usePatientListData(redo: any, ...args: Parameters<typeof getAllPatientLists>) {
  const [data, setData] = React.useState<State<Array<PatientListBase & { id: string }>>>({
    loading: true,
    data: undefined,
    error: undefined,
  });

  React.useEffect(() => {
    setupPromise
      .then(() => {
        setData({
          loading: true,
          data: undefined,
          error: undefined,
        });
        return getAllPatientLists(...args);
      })
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

export function useSingePatientListData(redo: any, ...args: Parameters<typeof getPatientListMembers>) {
  const [data, setData] = React.useState<State<Array<PatientListMember>>>({
    loading: true,
    data: undefined,
    error: undefined,
  });

  React.useEffect(() => {
    setupPromise
      .then(() => {
        setData({
          loading: true,
          data: undefined,
          error: undefined,
        });
        return getPatientListMembers(...args);
      })
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
