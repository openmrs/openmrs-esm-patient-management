import { openmrsFetch } from '@openmrs/esm-framework';
import {
  AddPatientData,
  CohortResponse,
  NewCohortData,
  OpenmrsCohort,
  OpenmrsCohortMember,
  OpenmrsCohortRef,
  PatientListFilter,
  PatientListMember,
  PatientListType,
} from './types';

export const cohortUrl = '/ws/rest/v1/cohortm';

async function postData(url: string, data = {}, ac = new AbortController()) {
  const response = await openmrsFetch(url, {
    signal: ac.signal,
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function getAllPatientLists(filter: PatientListFilter = {}, ac = new AbortController()) {
  const custom = 'custom:(uuid,name,description,display,size,attributes)';
  const query: Array<[string, string]> = [['v', custom]];

  if (filter.name !== undefined && filter.name !== '') {
    query.push(['q', filter.name]);
  }

  if (filter.isStarred !== undefined) {
    // TODO: correct this; it definitely is "attributes", but then we'd get back a 500 right now.
    query.push(['attribute', `starred:${filter.isStarred}`]);
  }

  if (filter.type !== undefined) {
    const type =
      filter.type === PatientListType.SYSTEM ? '"Patient List Type":"System"' : '"Patient List Type":"My lists"';
    query.push(['attributes', type]);
  }

  const params = query.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  const {
    data: { results, error },
  } = await openmrsFetch<CohortResponse<OpenmrsCohort>>(`${cohortUrl}/cohort?${params}`, {
    signal: ac.signal,
  });

  if (error) {
    throw error;
  }

  return results;
}

export async function getPatientListMembers(cohortUuid: string, ac = new AbortController()) {
  const {
    data: { results, error },
  } = await openmrsFetch<CohortResponse<OpenmrsCohortMember>>(
    `${cohortUrl}/cohortmember?cohort=${cohortUuid}&v=default`,
    {
      signal: ac.signal,
    },
  );

  if (error) {
    throw error;
  }

  const searchQuery = results.map((p) => p.patient.uuid).join(',');
  const result = await openmrsFetch(`/ws/fhir2/R4/Patient/_search?_id=${searchQuery}`, {
    method: 'POST',
    signal: ac.signal,
  });

  const patients: Array<PatientListMember> = result.data.entry.map((e) => e.resource);
  return patients;
}

export async function getPatientListIdsForPatient(patientUuid: string, ac = new AbortController()) {
  const {
    data: { results, error },
  } = await openmrsFetch<CohortResponse<OpenmrsCohortRef>>(
    `${cohortUrl}/cohortmember?patient=${patientUuid}&v=default`,
    {
      signal: ac.signal,
    },
  );

  if (error) {
    throw error;
  }

  return results.map((ref) => ref.cohort.uuid);
}

export async function addPatientToList(data: AddPatientData, ac = new AbortController()) {
  return postData(`${cohortUrl}/cohortmember`, data, ac);
}

export async function createPatientList(cohort: NewCohortData, ac = new AbortController()) {
  return postData(
    `${cohortUrl}/cohort`,
    {
      ...cohort,
      cohortType: '6df786bf-f15a-49c2-8d2b-1832d961c270',
      location: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
      startDate: '2020-01-01',
      groupCohort: true,
    },
    ac,
  );
}
