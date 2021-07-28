import { Location, OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import { PatientListFilter, PatientListType } from './types';

const cohortUrl = '/ws/rest/v1/cohortm';

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

export interface OpenmrsCohort {
  uuid: string;
  resourceVersion: string;
  name: string;
  description: string;
  attributes: Array<any>;
  links: Array<any>;
  location: Location | null;
  groupCohort: boolean | null;
  startDate: string | null;
  endDate: string | null;
  voidReason: string | null;
  voided: boolean;
  isStarred?: boolean;
  type?: string;
}

export interface OpenmrsCohortRef {
  cohort: OpenmrsCohortMember;
}

export interface OpenmrsCohortMember {
  attributes: Array<any>;
  description: string;
  endDate: string;
  name: string;
  uuid: string;
  patient: {
    uuid: string;
  };
}

interface CohortRepsonse<T> {
  results: Array<T>;
  error: any;
}

export async function getAllPatientLists(filter: PatientListFilter = {}, ac = new AbortController()) {
  const query: Array<[string, string]> = [['v', 'default']];

  if (filter.name !== undefined) {
    query.push(['q', filter.name]);
  }

  if (filter.isStarred !== undefined) {
    // TODO: correct this; it definitely is "attributes", but then we'd get back a 500 right now.
    query.push(['attribute', `starred:${filter.isStarred}`]);
  }

  if (filter.type !== undefined) {
    const type = filter.type === PatientListType.SYSTEM ? 'System Patient List' : '';
    query.push(['cohortType', type]);
  }

  const params = query.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&');
  const {
    data: { results, error },
  } = await openmrsFetch<CohortRepsonse<OpenmrsCohort>>(`${cohortUrl}/cohort?${params}`, {
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
  } = await openmrsFetch<CohortRepsonse<OpenmrsCohortMember>>(
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

  const patients: Array<OpenmrsResource> = result.data.entry.map((e) => e.resource);
  return patients;
}

export async function getPatientListsForPatient(patientUuid: string, ac = new AbortController()) {
  const {
    data: { results, error },
  } = await openmrsFetch<CohortRepsonse<OpenmrsCohortRef>>(
    `${cohortUrl}/cohortmember?patient=${patientUuid}&v=default`,
    {
      signal: ac.signal,
    },
  );

  if (error) {
    throw error;
  }

  return results;
}

export interface AddPatientData {
  patient: string;
  cohort: string;
  startDate: string;
}

export async function addPatientToList(data: AddPatientData, ac = new AbortController()) {
  return postData(`${cohortUrl}/cohortmember`, data, ac);
}

export interface NewCohortData {
  name: string;
  description: string;
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
