import dayjs from 'dayjs';
import { type APIRequestContext, expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';

export const startVisit = async (api: APIRequestContext, patientId: string, locationUuid?: string): Promise<Visit> => {
  const visitRes = await api.post('visit', {
    data: {
      startDatetime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
      patient: patientId,
      location: locationUuid || process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
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
      visitType: '7b0f5697-27e3-40c4-8bae-f4049abfb4ed',
      stopDatetime: dayjs().format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    },
  });
};
