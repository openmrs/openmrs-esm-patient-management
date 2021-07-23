import { isOfflineUuid } from '@openmrs/esm-framework';
import { useState, useEffect } from 'react';
import { getAllPatientLists, OpenmrsCohort } from './api';
import { getAllDeviceLocalPatientLists, getDeviceLocalPatientListMembers } from './';
import { getPatientListMembers } from './mock';
import { PatientListMember, PATIENT_LIST_TYPE, FetchState, PatientList } from './types';

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

/**
 * Hook for fetching all available patient lists with optionally provided filters and loading state information.
 */
export function usePatientListData(listTypeFilter?: PATIENT_LIST_TYPE, starredFilter?: boolean, nameFilter?: string) {
  const [data, setData] = useState<FetchState<Array<PatientList>>>(initialData);

  useEffect(() => {
    const ac = new AbortController();
    setData(initialData);

    getLocalAndOnlinePatientLists(listTypeFilter, starredFilter, nameFilter)
      .then((patientLists) =>
        setData({
          ...(loadedData as any),
          data: patientLists,
        }),
      )
      .catch((error) => error?.name !== 'AbortError' && setData({ ...loadedData, error }));
    return () => ac.abort();
  }, [listTypeFilter, starredFilter, nameFilter]);

  return data;
}

/** Fetches and merges patient lists from the device and backend into a single patient list array. */
async function getLocalAndOnlinePatientLists(
  filter?: PATIENT_LIST_TYPE,
  starred?: boolean,
  nameFilter?: string,
  ac = new AbortController(),
): Promise<Array<PatientList>> {
  const localPromise = getAllDeviceLocalPatientLists(filter, starred, nameFilter);
  const onlinePromise = getAllPatientLists(filter, starred, nameFilter, ac).then((cohorts) =>
    cohorts.map(mapCohortToPatientList),
  );
  return Promise.all([localPromise, onlinePromise]).then((lists) => [].concat.apply([], lists));
}

function mapCohortToPatientList(cohort: OpenmrsCohort): PatientList {
  return {
    id: cohort.uuid,
    display: cohort.name,
    description: cohort.description,
    type: PATIENT_LIST_TYPE.SYSTEM, // TODO
    memberCount: 0, // TODO
    isStarred: false, // TODO,
    isDeviceLocal: false,
  };
}

/**
 * Hook for fetching the members of the single patient list with the given {@link patientListId}.
 * @param patientListId The ID of the patient list whose memnbers should be resolved.
 */
export function useSinglePatientListData(patientListId: string) {
  const [data, setData] = useState<FetchState<Array<PatientListMember>>>(initialData);

  useEffect(() => {
    setData(initialData);

    const fetchingPromise = isOfflineUuid(patientListId)
      ? getDeviceLocalPatientListMembers(patientListId)
      : getPatientListMembers(patientListId);

    fetchingPromise
      .then((data) =>
        setData({
          ...(loadedData as any),
          data,
        }),
      )
      .catch((error) => error?.name !== 'AbortError' && setData({ ...loadedData, error }));
  }, [patientListId]);

  return data;
}
