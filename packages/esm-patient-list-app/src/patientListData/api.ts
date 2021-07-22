import { Location, OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import { PATIENT_LIST_TYPE } from './types';

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
  attributes: Array<any>;
  description: string;
  endDate: string;
  groupCohort: boolean;
  links: Array<any>;
  location: Location;
  name: string;
  resourceVersion: string;
  startDate: string;
  uuid: string;
  voidReason: string;
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

export async function getAllPatientLists(
  filter?: PATIENT_LIST_TYPE,
  starred?: boolean,
  nameFilter?: string,
  ac = new AbortController(),
) {
  const {
    data: { results, error },
  } = await openmrsFetch<CohortRepsonse<OpenmrsCohort>>(`${cohortUrl}/cohort?v=default`, {
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
