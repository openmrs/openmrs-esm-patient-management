import { type APIRequestContext, expect } from '@playwright/test';
import { type Cohort, type CohortMember } from '../types';

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
