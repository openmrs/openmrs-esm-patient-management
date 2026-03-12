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
  const response = await api.post(`visit/${uuid}`, {
    data: {
      stopDatetime: dayjs().add(1, 'minute').format('YYYY-MM-DDTHH:mm:ss.SSSZZ'),
    },
  });
  await expect(response.ok()).toBeTruthy();
};
