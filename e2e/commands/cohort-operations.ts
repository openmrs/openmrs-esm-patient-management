import { test } from '../core';
import { type APIRequestContext, expect } from '@playwright/test';
import { type Cohort, type CohortMember } from './types';

export const generateRandomCohort = async (api: APIRequestContext): Promise<Cohort> => {
  const suffix = `${test.info().project.name}-${test.info().workerIndex}-${Date.now().toString(36)}`;
  const patientListName = `Patient list — ${suffix}`;
  const patientListDescription = `Automated test (run ${suffix})`;

  const cohortRes = await api.post('cohortm/cohort', {
    data: {
      name: patientListName,
      description: patientListDescription,
      cohortType: 'e71857cb-33af-4f2c-86ab-7223bcfa37ad',
      groupCohort: false,
      startDate: new Date().toISOString(),
    },
  });
  await expect(cohortRes.ok()).toBeTruthy();
  return await cohortRes.json();
};

export const deleteCohort = async (api: APIRequestContext, uuid: string) => {
  if (!uuid) {
    return;
  }

  await api.delete(`cohortm/cohort/${uuid}`, {
    data: {
      voidReason: 'Test void reason',
    },
  });

  await api.delete(`cohortm/cohort/${uuid}?purge=true`);
};

const formatAsOpenmrsDate = (date: Date): string => {
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  const timezoneOffset = -date.getTimezoneOffset();
  const sign = timezoneOffset >= 0 ? '+' : '-';
  const hh = pad(Math.trunc(Math.abs(timezoneOffset) / 60));
  const mm = pad(Math.abs(timezoneOffset) % 60);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
    `${String(date.getMilliseconds()).padStart(3, '0')}${sign}${hh}${mm}`
  );
};

export async function addPatientToCohort(
  api: APIRequestContext,
  cohortUuid: string,
  patientUuid: string,
  start: Date = new Date(),
): Promise<CohortMember> {
  const payload = {
    cohort: cohortUuid,
    patient: patientUuid,
    startDate: formatAsOpenmrsDate(start),
  };
  const res = await api.post('cohortm/cohortmember', { data: payload });
  await expect(res.ok()).toBeTruthy();
  return (await res.json()) as CohortMember;
}

export const removePatientFromCohort = async (api: APIRequestContext, cohortMemberUuid: string) => {
  await api.delete(`cohortm/cohortmember/${cohortMemberUuid}`, {
    data: {},
  });
};
