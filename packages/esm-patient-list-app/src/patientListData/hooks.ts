import { isOfflineUuid } from '@openmrs/esm-framework';
import { useState, useEffect } from 'react';
import { getAllPatientLists, OpenmrsCohort } from './api';
import { getAllDeviceLocalPatientLists, getDeviceLocalPatientListMembers } from './';
import { getPatientListMembers } from './mock';
import { PatientListMember, PatientListType, FetchState, PatientList, PatientListFilter } from './types';

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
export function usePatientListData(userId: string, filter?: PatientListFilter) {
  const [data, setData] = useState<FetchState<Array<PatientList>>>(initialData);

  useEffect(() => {
    const ac = new AbortController();
    setData(initialData);

    getLocalAndOnlinePatientLists(userId, filter)
      .then((patientLists) =>
        setData({
          ...(loadedData as any),
          data: patientLists,
        }),
      )
      .catch((error) => error?.name !== 'AbortError' && setData({ ...loadedData, error }));
    return () => ac.abort();
  }, [userId, filter]);

  return data;
}

/** Fetches and merges patient lists from the device and backend into a single patient list array. */
async function getLocalAndOnlinePatientLists(
  userId: string,
  filter?: PatientListFilter,
  ac = new AbortController(),
): Promise<Array<PatientList>> {
  const localPromise = getAllDeviceLocalPatientLists(userId, filter);
  const onlinePromise = getAllPatientLists(filter, ac).then((cohorts) => cohorts.map(mapCohortToPatientList));
  return Promise.all([localPromise, onlinePromise]).then((lists) => [].concat.apply([], lists));
}

function mapCohortToPatientList(cohort: OpenmrsCohort): PatientList {
  return {
    id: cohort.uuid,
    display: cohort.name,
    description: cohort.description,
    type: PatientListType.SYSTEM, // TODO
    memberCount: 0, // TODO
    isStarred: false, // TODO,
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
