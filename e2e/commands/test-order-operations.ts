import { type APIRequestContext, expect } from '@playwright/test';
import { type Order } from '@openmrs/esm-patient-common-lib';
import { type Encounter, type Patient, type Provider, type Bed, type BedType } from './types';
import { generateRandomPatient, deletePatient } from './patient-operations';
import { startVisit, endVisit } from './visit-operations';
import { getProvider } from './provider-operations';
import { createEncounter, deleteEncounter, generateWardAdmission } from './encounter-operations';
import { generateBedType, generateRandomBed } from './bed-operations';

export interface LabOperationResults {
  patient: Patient;
  provider: Provider;
  visitUuid: string;
  encounter: Encounter;
  orderUuid: string;
}

export interface LabOrderWithBedResults extends LabOperationResults {
  bed: Bed;
  bedType: BedType;
}

export const CreatePatientWithOrderedLabOrders = async (api: APIRequestContext): Promise<LabOperationResults> => {
  const patient = await generateRandomPatient(api);
  const provider = await getProvider(api);
  const visit = await startVisit(api, patient.uuid);
  const encounter = await createEncounter(api, patient.uuid, provider.uuid);
  const order = await generateRandomTestOrder(api, patient.uuid, encounter, provider.uuid);
  return {
    patient,
    provider,
    visitUuid: visit.uuid,
    encounter,
    orderUuid: order.uuid,
  };
};

export const CreatePatientWithOrderedLabOrdersAndBedAssignment = async (
  api: APIRequestContext,
): Promise<LabOrderWithBedResults> => {
  const patient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  const provider = await getProvider(api);
  const bedType = await generateBedType(api);
  const bed = await generateRandomBed(api, bedType);
  const visit = await startVisit(api, patient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  const labEncounter = await createEncounter(api, patient.uuid, provider.uuid);
  const order = await generateRandomTestOrder(api, patient.uuid, labEncounter, provider.uuid);
  const encounter = await generateWardAdmission(api, provider.uuid, patient.uuid);

  return {
    patient,
    provider,
    visitUuid: visit.uuid,
    encounter,
    orderUuid: order.uuid,
    bed,
    bedType,
  };
};

export const generateRandomTestOrder = async (
  api: APIRequestContext,
  patientId: string,
  encounter: Encounter,
  providerUuid: string,
): Promise<Order> => {
  const order = await api.post('order', {
    data: {
      orderType: '52a447d3-a64a-11e3-9aeb-50e549534c5e',
      type: 'testorder',
      action: 'new',
      accessionNumber: null,
      urgency: 'ROUTINE',
      dateActivated: encounter.encounterDateTime,
      scheduledDate: null,
      dateStopped: null,
      autoExpireDate: null,
      careSetting: '6f0c9a92-6f24-11e3-af88-005056821db0',
      encounter: encounter,
      patient: patientId,
      concept: '887AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      orderer: providerUuid,
      frequency: null,
      orderReason: null,
      orderReasonNonCoded: 'order reason',
      instructions: null,
      commentToFulfiller: null,
      fulfillerStatus: null,
      fulfillerComment: null,
      specimenSource: null,
      laterality: null,
      clinicalHistory: null,
      numberOfRepeats: null,
    },
  });
  await expect(order.ok()).toBeTruthy();
  return await order.json();
};

export const deleteTestOrder = async (api: APIRequestContext, uuid: string) => {
  await api.delete(`order/${uuid}`, { data: {} });
};

export const cleanupLabOrderWithBed = async (
  api: APIRequestContext,
  params: {
    orderUuid: string;
    encounterUuid: string;
    visitUuid: string;
    patientUuid?: string;
    bedUuid?: string;
    bedTypeUuid?: string;
    labEncounterUuid?: string;
  },
) => {
  await deleteTestOrder(api, params.orderUuid);
  await deleteEncounter(api, params.encounterUuid);
  await deleteEncounter(api, params.labEncounterUuid);
  await endVisit(api, params.visitUuid);

  if (params.patientUuid) {
    await deletePatient(api, params.patientUuid);
  }

  // Note: Bed and bedType cleanup would need to be added to bed-operations.ts if needed
};
