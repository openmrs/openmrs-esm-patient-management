import { type APIRequestContext, expect } from '@playwright/test';
import { type Cohort, type CohortMember } from './types';

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

// commands/addPatientToCohort.ts
function formatAsOpenmrsDate(date: Date): string {
  // "yyyy-MM-dd'T'HH:mm:ss.SSS+0000" (OpenMRS-friendly)
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  const tz = -date.getTimezoneOffset(); // minutes east of UTC
  const sign = tz >= 0 ? '+' : '-';
  const hh = pad(Math.trunc(Math.abs(tz) / 60));
  const mm = pad(Math.abs(tz) % 60);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.` +
    `${String(date.getMilliseconds()).padStart(3, '0')}${sign}${hh}${mm}`
  );
}

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
