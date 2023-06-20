import { APIRequestContext, expect } from '@playwright/test';
import { Patient } from './patient-operations';

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

export const generateRandomCohort = async (api: APIRequestContext): Promise<Cohort> => {
  const cohortRes = await api.post('cohortm/cohort', {
    data: {
      name: `Cohort ${Math.floor(Math.random() * 10000)}`,
      description: `Cohort description ${Math.floor(Math.random() * 10000)}`,
      cohortType: 'e71857cb-33af-4f2c-86ab-7223bcfa37ad',
      groupCohort: false,
      startDate: new Date().toISOString(),
    },
  });
  await expect(cohortRes.ok()).toBeTruthy();
  return await cohortRes.json();
};

export const deleteCohort = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`cohortm/cohort/${uuid}`, {
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
  const cohortMemberRes = await api.post(`cohortm/cohortmember`, {
    data: {
      patient: patientUuid,
      cohort: cohortUuid,
      startDate: new Date().toISOString(),
    },
  });
  await expect(cohortMemberRes.ok()).toBeTruthy();
  return await cohortMemberRes.json();
};

export const removePatientFromCohort = async (api: APIRequestContext, cohortMemberUuid: string) => {
  await api.delete(`cohortm/cohortmember/${cohortMemberUuid}`, {
    data: {},
  });
};
