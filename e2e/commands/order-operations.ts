import { type APIRequestContext, expect } from '@playwright/test';
import { type Encounter, type Patient } from './types';
import { generateRandomPatient } from './patient-operations';
import { startVisit } from './visit-operations';
import { getProvider } from './provider-operations';
import { createEncounter, generateWardAdmissionRequest } from './encounter-operations';
import { generateBedType, generateRandomBed } from './bed-operations';

export const createLabOrder = async (
  api: APIRequestContext,
  patientId: string,
  encounter: Encounter,
  providerUuid: string,
) => {
  const orderRes = await api.post('order', {
    data: {
      orderType: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
      type: 'testorder',
      action: 'new',
      urgency: 'ROUTINE',
      dateActivated: encounter.encounterDateTime,
      careSetting: '6f0c9a92-6f24-11e3-af88-005056821db0',
      encounter: encounter.uuid,
      patient: patientId,
      concept: '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      orderer: providerUuid,
      orderReasonNonCoded: 'E2E testing',
    },
  });
  await expect(orderRes.ok()).toBeTruthy();
  return await orderRes.json();
};

export const deleteOrder = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`order/${uuid}`);
};

export const createPatientWithOrderedLabOrdersAndBedAssignment = async (api: APIRequestContext) => {
  const patient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  const provider = await getProvider(api);
  const visit = await startVisit(api, patient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  const labEncounter = await createEncounter(api, patient.uuid, provider.uuid);
  const order = await createLabOrder(api, patient.uuid, labEncounter, provider.uuid);
  const admissionEncounter = await generateWardAdmissionRequest(api, provider.uuid, patient.uuid);
  const bedType = await generateBedType(api);
  const bed = await generateRandomBed(api, bedType);

  return { patient, visit, labEncounter, order, admissionEncounter, bed, bedType };
};

export const cleanupLabOrderWithBed = async (
  api: APIRequestContext,
  params: {
    orderUuid: string;
    labEncounterUuid: string;
    admissionEncounterUuid: string;
    visitUuid: string;
    patientUuid: string;
    bedUuid: string;
    bedTypeUuid: string;
  },
) => {
  await deleteOrder(api, params.orderUuid);
  await api.delete(`encounter/${params.labEncounterUuid}`);
  await api.delete(`encounter/${params.admissionEncounterUuid}`);
};
