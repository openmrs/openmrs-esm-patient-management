import { type APIRequestContext, expect } from '@playwright/test';
import dayjs from 'dayjs';
import { type Visit } from '@openmrs/esm-framework';
import { type Encounter } from './types';

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

export const generateWarAdmission = async (
  api: APIRequestContext,
  providerId: string,
  patientId: string,
): Promise<Encounter> => {
  const formRes = await api.post(
    '/openmrs/ws/rest/v1/encounter?v=custom:(uuid,encounterDatetime,encounterType:(uuid,name,description),location:(uuid,name),patient:(uuid,display),encounterProviders:(uuid,provider:(uuid,name),encounterRole:(uuid,name)),orders:(uuid,display,concept:(uuid,display),voided),diagnoses:(uuid,certainty,condition,formFieldPath,formFieldNamespace,display,rank,voided,diagnosis:(coded:(uuid,display))),obs:(uuid,obsDatetime,comment,voided,groupMembers,formFieldNamespace,formFieldPath,concept:(uuid,name:(uuid,name)),value:(uuid,name:(uuid,name),names:(uuid,conceptNameType,name))))',
    {
      data: {
        patient: patientId,
        encounterDatetime: dayjs().format(),
        location: process.env.E2E_WARD_LOCATION_UUID,
        encounterType: 'b2c4d5e6-7f8a-4e9b-8c1d-2e3f8e4a3b8f',
        encounterProviders: [
          {
            provider: providerId,
            encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          },
        ],
        obs: [
          {
            groupMembers: [
              {
                value: '77eafb3f-58d3-4397-a6dc-d2c06e9062f3',
                concept: 'ce085d74-323c-4c9a-9fdf-051de81dd020',
                formFieldNamespace: 'rfe-forms',
                formFieldPath: 'rfe-forms-disposition',
              },
              {
                value: 'ba685651-ed3b-4e63-9b35-78893060758a',
                concept: 'b9cd9e47-da43-4a46-8f3c-e30ec9209cc7',
                formFieldNamespace: 'rfe-forms',
                formFieldPath: 'rfe-forms-admitToLocation',
              },
            ],
            concept: '9ceedfb7-60e4-42ce-a11e-f2dbabc82112',
            formFieldNamespace: 'rfe-forms',
            formFieldPath: 'rfe-forms-inpatientDispositionConstruct',
          },
        ],
        form: {
          uuid: 'c4efe3f7-a556-3377-bc69-cae193418ebd',
        },
        orders: [],
        diagnoses: [],
      },
    },
  );
  await expect(formRes.ok()).toBeTruthy();
  const encounter = await formRes.json();
  return encounter;
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
