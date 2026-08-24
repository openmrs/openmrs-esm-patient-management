import dayjs from 'dayjs';
import { type APIRequestContext, expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';

export const startVisit = async (api: APIRequestContext, patientId: string, locationUuid?: string): Promise<Visit> => {
  const visitRes = await api.post('visit', {
    data: {
      startDatetime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      patient: patientId,
      location: locationUuid || process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      visitType: process.env.E2E_PATIENT_VISIT_TYPE_UUID,
      attributes: [],
    },
  });

  await expect(visitRes.ok()).toBeTruthy();
  return await visitRes.json();
};

/** A visit the Previous visit tab will surface: ended, and falling wholly before today. */
export const startPastVisit = async (
  api: APIRequestContext,
  patientId: string,
  locationUuid?: string,
): Promise<Visit> => {
  const startDatetime = dayjs().subtract(1, 'day').hour(9).minute(0).second(0);

  const visitRes = await api.post('visit', {
    data: {
      startDatetime: startDatetime.format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      stopDatetime: startDatetime.add(3, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      patient: patientId,
      location: locationUuid || process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      visitType: process.env.E2E_PATIENT_VISIT_TYPE_UUID,
      attributes: [],
    },
  });

  await expect(visitRes.ok()).toBeTruthy();
  return await visitRes.json();
};

export const endVisit = async (api: APIRequestContext, uuid: string, isWardTest = false) => {
  await api.post(`visit/${uuid}`, {
    data: {
      location: isWardTest ? process.env.E2E_WARD_LOCATION_UUID : process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      startDatetime: dayjs().subtract(1, 'D').format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      visitType: process.env.E2E_PATIENT_VISIT_TYPE_UUID,
      stopDatetime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    },
  });
};
