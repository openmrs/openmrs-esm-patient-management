import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType, type Encounter, type Patient, type Provider } from '../commands/types';
import {
  createPatientWithOrderedLabOrdersAndBedAssignment,
  cleanupLabOrderWithBed,
  changeToWardLocation,
} from '../commands';
import { test } from '../core';
import { WardPage } from '../pages';
import { Header } from '@carbon/react';

let bed: Bed;
let bedType: BedType;
let encounter: Encounter;
let provider: Provider;
let visitUuid: string;
let wardPatient: Patient;

let generatedData: any;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  generatedData = await createPatientWithOrderedLabOrdersAndBedAssignment(api);
  bed = generatedData.bed;
  bedType = generatedData.bedType;
  provider = generatedData.provider;
  wardPatient = generatedData.patient;
  visitUuid = generatedData.visitUuid;
  encounter = generatedData.encounter;
});

test('View lab orders in the patient Card in the Ward App', async ({ api, page }) => {
  const wardPage = new WardPage(page);
  const patientName = wardPatient.person?.display;
  await test.step('When I navigate to the Ward App page', async () => {
    await wardPage.goTo();
  });
  await test.step('I should see "Ward Patient" title', async () => {
    await expect(page.getByRole('heading', { name: 'Inpatient Ward' })).toBeVisible();
  });
  await test.step('And I click the "Manage" button to view admission requests', async () => {
    await wardPage.clickManageAdmissionRequests();
  });
  await test.step('Click "Admit Patient" button', async () => {
    await wardPage.clickAdmitPatientButton(patientName);
  });
  await test.step('And I select the bed for admission', async () => {
    await page.getByText(`${bed.bedNumber} · Empty`).click();
  });

  await test.step('And I admit the patient', async () => {
    await wardPage.clickAdmitButton();
  });
  await test.step('Then I see the patient in the ward with the lab orders banner', async () => {
    const patientCard = page.locator(`[class*="wardPatientCard"]:has-text("${patientName}")`).first();
    await patientCard.waitFor({ state: 'visible' });

    await expect(patientCard.getByText('1 Labs')).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await cleanupLabOrderWithBed(api, {
    orderUuid: generatedData.orderUuid,
    encounterUuid: generatedData.encounter.uuid,
    visitUuid: generatedData.visitUuid,
    patientUuid: generatedData.patient.uuid,
    bedUuid: generatedData.bed.uuid,
    bedTypeUuid: generatedData.bedType.uuid,
  });
});
