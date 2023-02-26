import { APIRequestContext, expect } from '@playwright/test';
import { Patient } from './patientOperations';

export interface CohortType {
  uuid: string;
  name: string;
  description: string;
  display: string;
  links: { rel: string; uri: string; resourceAlias: string }[];
  resourceVersion: string;
}

export interface Cohort {
  uuid: string;
  name: string;
  description: string;
  attributes: any[];
  links: any[];
  location: any;
  groupCohort: boolean | null;
  startDate: Date;
  endDate: Date;
  voidReason: string | null;
  voided: boolean;
  isStarred?: boolean;
  type?: string;
  size: number;
  cohortType?: CohortType;
  resourceVersion: string;
}

export interface CohortMember {
  attributes: Array<any>;
  description: string;
  endDate: string;
  startDate: string;
  name: string;
  uuid: string;
  patient: Patient;
}

export const generateRandomCohortType = async (api: APIRequestContext): Promise<CohortType> => {
  const cohortTypeRes = await api.post('rest/v1/cohortm/cohorttype', {
    data: {
      name: `Cohort type ${Math.floor(Math.random() * 10000)}`,
      description: `Cohort type description ${Math.floor(Math.random() * 10000)}`,
    },
  });
  await expect(cohortTypeRes.ok()).toBeTruthy();
  return await cohortTypeRes.json();
};

export const deleteCohortType = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`rest/v1/cohortm/cohorttype/${uuid}`, { data: {} });
};

export const generateRandomCohort = async (api: APIRequestContext, cohortTypeUuid: string): Promise<Cohort> => {
  const cohortRes = await api.post('rest/v1/cohortm/cohort', {
    data: {
      name: `Cohort ${Math.floor(Math.random() * 10000)}`,
      description: `Cohort description ${Math.floor(Math.random() * 10000)}`,
      cohortType: cohortTypeUuid,
      groupCohort: false,
      startDate: new Date().toISOString(),
    },
  });
  await expect(cohortRes.ok()).toBeTruthy();
  return await cohortRes.json();
};

export const deleteCohort = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`rest/v1/cohortm/cohort/${uuid}`, {
    data: {
      voidReason: 'Test void reason',
    },
  });
};

export const addPatientToCohort = async (
  api: APIRequestContext,
  cohortUuid: string,
  patientUuid: string,
): Promise<CohortMember> => {
  const cohortMemberRes = await api.post(`rest/v1/cohortm/cohortmember`, {
    data: {
      patient: patientUuid,
      cohort: cohortUuid,
      startDate: new Date().toISOString(),
    },
  });
  await expect(cohortMemberRes.ok()).toBeTruthy();
  return await cohortMemberRes.json();
};
