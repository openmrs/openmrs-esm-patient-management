import { type APIRequestContext, expect } from '@playwright/test';
import dayjs from 'dayjs';
import { type Encounter } from '../types';

export const createEncounter = async (
  api: APIRequestContext,
  patientId: string,
  providerId: string,
  note?: string,
): Promise<Encounter> => {
  const observations = [];

  if (note) {
    observations.push({
      concept: {
        uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
        display: '',
      },
      value: note,
    });
  }
  const encounterRes = await api.post('encounter', {
    data: {
      encounterDatetime: dayjs().format(),
      form: 'c75f120a-04ec-11e3-8780-2b40bef9a44b',
      patient: patientId,
      encounterProviders: [
        {
          encounterRole: '240b26f9-dd88-4172-823d-4a8bfeb7841f',
          provider: providerId,
        },
      ],
      location: process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
      encounterType: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
      obs: observations,
    },
  });
  await expect(encounterRes.ok()).toBeTruthy();
  return await encounterRes.json();
};

export const generateWardAdmission = async (
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
        encounterType: process.env.E2E_ENCOUNTER_TYPE,
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

export const deleteEncounter = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`encounter/${uuid}`, { data: {} });
};
