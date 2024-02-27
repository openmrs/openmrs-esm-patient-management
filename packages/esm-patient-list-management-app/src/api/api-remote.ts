import { type LoggedInUser, openmrsFetch, refetchCurrentUser, restBaseUrl, fhirBaseUrl } from '@openmrs/esm-framework';
import {
  type AddPatientData,
  type CohortResponse,
  type NewCohortData,
  type NewCohortDataPayload,
  type OpenmrsCohort,
  type OpenmrsCohortMember,
  type OpenmrsCohortRef,
  type PatientListFilter,
  type PatientListMember,
  PatientListType,
  type PatientListUpdate,
} from './types';

export const cohortUrl = `${restBaseUrl}/cohortm`;

async function postData(url: string, data = {}, ac = new AbortController()) {
  const response = await openmrsFetch(url, {
    signal: ac.signal,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.data;
}

async function deleteData(url: string, data = {}, ac = new AbortController()) {
  const response = await openmrsFetch(url, {
    signal: ac.signal,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return response.data;
}

export async function getAllPatientLists(
  filter: PatientListFilter = {},
  myListCohortTypeUUID,
  systemListCohortTypeUUID,
  ac = new AbortController(),
) {
  const custom = 'custom:(uuid,name,description,display,size,attributes,cohortType)';
  const query: Array<[string, string]> = [['v', custom]];

  if (filter.name !== undefined && filter.name !== '') {
    query.push(['q', filter.name]);
  }

  if (filter.isStarred !== undefined) {
    // TODO: correct this; it definitely is "attributes", but then we'd get back a 500 right now.
    query.push(['attribute', `starred:${filter.isStarred}`]);
  }

  if (filter.type === PatientListType.USER) {
    query.push(['cohortType', myListCohortTypeUUID]);
  } else if (filter.type === PatientListType.SYSTEM) {
    query.push(['cohortType', systemListCohortTypeUUID]);
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

  return results.map((cohort) => ({
    id: cohort.uuid,
    display: cohort.name,
    description: cohort.description,
    type: cohort.cohortType?.display,
    size: cohort.size,
    isStarred: false, // TODO
  }));
}

export function starPatientList(userUuid: string, userProperties: LoggedInUser['userProperties']) {
  return openmrsFetch(`${restBaseUrl}/user/${userUuid}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: {
      userProperties,
    },
  }).then(() => {
    refetchCurrentUser();
  });
}

export function updatePatientList(id: string, update: PatientListUpdate) {
  // TODO: Support updating a full patient list, i.e. including the `isStarred` value.
  // Basically implement the (missing) functionality which was previously declared as "TODO" here:
  // https://github.com/openmrs/openmrs-esm-patient-management/blob/25ec687afd37c383a0dbd4d8be8b8e09c8c53129/packages/esm-patient-list-management-app/src/api/api.ts#L89
  return Promise.resolve();
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

  const currentDate = new Date();
  const searchQuery = results.map((p) => p.patient.uuid).join(',');

  const result = await openmrsFetch(`${fhirBaseUrl}/Patient/_search?_id=${searchQuery}`, {
    method: 'POST',
    signal: ac.signal,
  });

  const patients: Array<PatientListMember> = result.data.entry.map((e) => e.resource);
  const validPatients = patients.filter((patient) => {
    if (!patient.endDate) {
      return true;
    }

    const endDate = new Date(patient.endDate);
    return endDate >= currentDate;
  });

  return validPatients;
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

export async function addPatientToList(data: AddPatientData) {
  return postData(`${cohortUrl}/cohortmember`, data);
}

export async function removePatientFromList(cohortMembershipUuid: string) {
  return postData(`${cohortUrl}/cohortmember/${cohortMembershipUuid}`, {
    endDate: new Date(),
  });
}

export async function createPatientList(cohort: NewCohortDataPayload, ac = new AbortController()) {
  return postData(
    `${cohortUrl}/cohort/`,
    {
      ...cohort,
      startDate: new Date(),
      groupCohort: false,
      definitionHandlerClassname: 'org.openmrs.module.cohort.definition.handler.DefaultCohortDefinitionHandler',
    },
    ac,
  );
}

export async function editPatientList(cohortUuid: string, cohort: NewCohortData, ac = new AbortController()) {
  return postData(`${cohortUrl}/cohort/${cohortUuid}`, cohort, ac);
}

export async function deletePatientList(cohortUuid: string, ac = new AbortController()) {
  return deleteData(
    `${cohortUrl}/cohort/${cohortUuid}`,
    {
      voidReason: '',
    },
    ac,
  );
}

export async function getPatientListName(patientListUuid: string) {
  const abortController = new AbortController();

  try {
    const url = `${cohortUrl}/cohort/${patientListUuid}?`;
    const { data } = await openmrsFetch<OpenmrsCohort>(url, {
      signal: abortController.signal,
    });
    return data?.name;
  } catch (error) {
    console.error('Error resolving patient list name: ', error);
  }
}
