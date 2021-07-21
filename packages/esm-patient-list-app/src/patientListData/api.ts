import { Location, OpenmrsResource, openmrsFetch } from '@openmrs/esm-framework';
import { PATIENT_LIST_TYPE } from './types';

async function postData(url = '', data = {}) {
  const response = await openmrsFetch(url, {
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

export async function getAllPatientLists(filter?: PATIENT_LIST_TYPE, starred?: boolean, nameFilter?: string) {
  const {
    data: { results, error },
  } = await openmrsFetch<CohortRepsonse<OpenmrsCohort>>('/ws/rest/v1/cohortm/cohort?v=default');

  if (error) {
    throw error;
  }

  return results;
}

export async function getPatientListMembers(cohortUuid: string) {
  const {
    data: { results, error },
  } = await openmrsFetch<CohortRepsonse<OpenmrsCohortMember>>(
    `/ws/rest/v1/cohortm/cohortmember?cohort=${cohortUuid}&v=default`,
  );

  if (error) {
    throw error;
  }

  const resources = await openmrsFetch(
    '/ws/fhir2/R4/Patient/_search?_id=' + results.map((p) => p.patient.uuid).join(','),
    {
      method: 'POST',
    },
  ).then((res) => res.data);

  const patients: Array<OpenmrsResource> = resources.entry.map((e) => e.resource);

  return patients;
}

export async function getPatientListsForPatient(patientUuid: string) {
  const {
    data: { results, error },
  } = await openmrsFetch<CohortRepsonse<OpenmrsCohortRef>>(
    `/ws/rest/v1/cohortm/cohortmember?patient=${patientUuid}&v=default`,
  );

  if (error) {
    throw error;
  }

  return results;
}

export async function addPatientToList(data: { patient: string; cohort: string; startDate: string }) {
  return postData('/ws/rest/v1/cohortm/cohortmember', data);
}

export async function createPatientList(cohort: { name: string }) {
  return postData('/ws/rest/v1/cohortm/cohort', {
    ...cohort,
    cohortType: '6df786bf-f15a-49c2-8d2b-1832d961c270',
    location: 'aff27d58-a15c-49a6-9beb-d30dcfc0c66e',
    startDate: '2020-01-01',
    groupCohort: true,
  });
}
