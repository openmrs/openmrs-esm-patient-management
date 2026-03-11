import { expect } from '@playwright/test';
import { test } from '../core';
import {
  changeToWardLocation,
  deletePatient,
  endVisit,
  generateRandomPatient,
  generateWardAdmissionRequest,
  getProvider,
  startVisit,
  waitForAdmissionRequestToBeProcessed,
  waitForAdmissionToBeProcessed,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType, type Patient, type Provider } from '../commands/types';
import { dischargePatientFromBed, generateBedType, generateRandomBed, retireBedType } from '../commands/bed-operations';
import { WardPage } from '../pages';

let bed: Bed;
let bedType: BedType;
let provider: Provider;
let visit: Visit;
let wardPatient: Patient;

test.beforeEach(async ({ api, page }) => {
  await changeToWardLocation(api);
  bedType = await generateBedType(api);
  bed = await generateRandomBed(api, bedType);
  provider = await getProvider(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  await generateWardAdmissionRequest(api, provider.uuid, wardPatient.uuid);
  await waitForAdmissionRequestToBeProcessed(api, page, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID as string);
});

test('Manage patient lifecycle in a ward', async ({ page, api }) => {
  const patientName = wardPatient.person?.display;
  const wardPage = new WardPage(page);

  await test.step('When I go to the Wards page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I click the "Manage" button to view admission requests', async () => {
    await wardPage.clickManageAdmissionRequests();
  });

  await test.step('And I click the "Admit patient" button for the patient', async () => {
    await wardPage.clickAdmitPatientButton(patientName);
  });

  await test.step('And I select the bed for admission and confirm', async () => {
    await page.getByText(`${bed.bedNumber} · Empty`).click();
    await page.getByRole('button', { name: 'Admit', exact: true }).click();
  });

  await test.step('Then I should see a success notification confirming the admission', async () => {
    await wardPage.expectAdmissionSuccessNotification(patientName as string, bed.bedNumber);
  });

  await test.step('And the patient should be visible in the ward view', async () => {
    await wardPage.waitForPatientInWardView(patientName as string);
  });

  await test.step('And I wait for the admission to be available in the API', async () => {
    await waitForAdmissionToBeProcessed(api, page, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID as string);
  });

  await test.step('When I click the patient card to open the patient workspace', async () => {
    await wardPage.clickPatientCard(patientName as string);
  });

  await test.step('And I click the "Patient note" button and record a clinical note', async () => {
    await wardPage.clickPatientNotesButton();
    await wardPage.fillWardAdmissionNote('Automated E2E test note');
    await wardPage.clickSaveButton();
  });

  await test.step('Then I should see a success message confirming the note was saved', async () => {
    await expect(page.getByText(/patient note saved/i)).toBeVisible();
  });

  await test.step('When I attempt to transfer the patient to a different ward', async () => {
    await wardPage.clickPatientCard(patientName as string);
    await wardPage.clickTransferSiderailIcon();
    await wardPage.attemptTransferThePatient('Isolation Ward', 'Transferring patient for E2E test');
  });

  await test.step('When I discharge the patient from the ward', async () => {
    await wardPage.clickDischargeButton();
    await wardPage.clickConfirmDischargeButton();
  });

  await test.step('Then I should see a success message confirming the discharge', async () => {
    await wardPage.expectDischargeSuccess();
  });

  await test.step('And the patient should no longer be listed in the ward card view', async () => {
    await expect(page.getByText(patientName as string, { exact: true })).toBeHidden();
  });
});

test.afterEach(async ({ api }) => {
  await dischargePatientFromBed(api, bed.id, wardPatient.uuid);
  await retireBedType(api, bedType.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});
