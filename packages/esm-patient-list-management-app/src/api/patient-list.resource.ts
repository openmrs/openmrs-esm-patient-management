import { useTranslation } from 'react-i18next';
import { type TFunction } from 'i18next';
import useSWR from 'swr';
import {
  type LoggedInUser,
  openmrsFetch,
  refetchCurrentUser,
  restBaseUrl,
  fhirBaseUrl,
  toOmrsIsoString,
  useConfig,
} from '@openmrs/esm-framework';
import { type PatientListManagementConfig } from '../config-schema';
import {
  type AddPatientData,
  type AddablePatientListViewModel,
  type CohortResponse,
  type NewCohortData,
  type NewCohortDataPayload,
  type OpenmrsCohort,
  type OpenmrsCohortMember,
  type OpenmrsCohortRef,
  type PatientListFilter,
  type PatientListMember,
  type PatientListUpdate,
  PatientListType,
} from './types';

export type FieldError = {
  [key: string]: Array<{ code: string; message: string }>;
};

export type ErrorObject = {
  error: {
    code: string;
    message: string;
    detail: string;
    fieldErrors?: FieldError;
    globalErrors?: FieldError;
  };
};

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

export function extractErrorMessagesFromResponse(errorObject: ErrorObject, t?: TFunction) {
  const {
    error: { fieldErrors, globalErrors, message, code },
  } = errorObject ?? {};

  if (fieldErrors) {
    return Object.values(fieldErrors)
      .flatMap((errors) => errors.map((error) => error.message))
      .join('\n');
  }

  if (globalErrors) {
    return Object.values(globalErrors)
      .flatMap((errors) => errors.map((error) => error.message))
      .join('\n');
  }

  return message ?? code ?? t('unknownError', 'An unknown error occurred');
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

interface PagedCohortResponse<T> extends CohortResponse<T> {
  links?: Array<{ rel: string; uri: string }>;
}

/**
 * Loads every page of a cohort module list. The REST API returns 50 results per page by default,
 * with a `next` link while more remain.
 *
 * The `next` link is only used to tell whether more results remain. Later pages are requested by
 * adding `startIndex` to the same relative URL, so that, like the first page, they go through
 * `openmrsFetch` to the configured API base rather than to the host the server put in the link.
 */
async function fetchAllPages<T>(url: string, ac: AbortController): Promise<Array<T>> {
  const results: Array<T> = [];

  while (true) {
    const pageUrl = results.length ? `${url}&startIndex=${results.length}` : url;
    const { data } = await openmrsFetch<PagedCohortResponse<T>>(pageUrl, { signal: ac.signal });

    if (data?.error) {
      throw data.error;
    }

    const page = data?.results ?? [];
    results.push(...page);

    const hasNextPage = data?.links?.some((link) => link.rel === 'next');
    // Stop on an empty page too, so a `next` link without results can't loop forever.
    if (!hasNextPage || page.length === 0) {
      return results;
    }
  }
}

export async function getAllPatientLists(
  filter: PatientListFilter = {},
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

  if (filter.type === PatientListType.SYSTEM) {
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

/** Only what the patient list page shows; `v=full` is many times larger. */
const listMemberRepresentation =
  'custom:(uuid,startDate,patient:(uuid,identifiers:(identifier),person:(display,gender,attributes:(value,attributeType:(display)))))';

/**
 * The URL of a list's members. 100 is the most the REST API returns per page by default. A server
 * with a lower maximum returns smaller pages, which `fetchAllPages` handles.
 */
export function getAllPatientListMembersUrl(patientListUuid: string) {
  return `${cohortUrl}/cohortmember?cohort=${patientListUuid}&v=${listMemberRepresentation}&limit=100`;
}

export function getAllPatientListMembers(url: string) {
  return fetchAllPages<OpenmrsCohortMember>(url, new AbortController());
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

export async function findRealPatientListsWithoutPatient(
  patientUuid: string,
  systemListCohortType: string,
): Promise<Array<AddablePatientListViewModel>> {
  const [allLists, listsIdsOfThisPatient] = await Promise.all([
    getAllPatientLists({}, systemListCohortType),
    getPatientListIdsForPatient(patientUuid),
  ]);

  return allLists.map((list) => ({
    id: list.id,
    displayName: list.display,
    checked: listsIdsOfThisPatient.includes(list.id),
    async addPatient() {
      await addPatientToList({
        cohort: list.id,
        patient: patientUuid,
        startDate: toOmrsIsoString(new Date()),
      });
    },
  }));
}

export function useAddablePatientLists(patientUuid: string) {
  const config = useConfig<PatientListManagementConfig>();
  return useSWR(['addablePatientLists', patientUuid], async () => {
    try {
      return await findRealPatientListsWithoutPatient(patientUuid, config.systemListCohortTypeUUID);
    } catch {
      return [];
    }
  });
}
