import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
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
import { dischargePatientFromBed, generateBedType, generateRandomBed, retireBedType } from '../commands/bed-operations';
import { type Bed, type BedType, type Patient, type Provider } from '../commands/types';
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
  visit = await startVisit(api, wardPatient?.uuid, process.env.E2E_WARD_LOCATION_UUID);
  await generateWardAdmissionRequest(api, provider.uuid, wardPatient?.uuid);
  await waitForAdmissionRequestToBeProcessed(api, page, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID as string);
});

test('Add a patient note to an inpatient admission', async ({ page, api }) => {
  const fullName = wardPatient.person?.display;
  const wardPage = new WardPage(page);

  await test.step('When I visit the patient ward page', async () => {
    await wardPage.goTo();
  });

  await test.step('And I click the "Manage" button to view admission requests', async () => {
    await wardPage.clickManageAdmissionRequests();
  });

  await test.step('Then I verify the patient has a pending admission request', async () => {
    await wardPage.waitForAdmissionRequest(fullName);
  });

  await test.step('And I click the "Admit patient" button for the patient', async () => {
    await wardPage.clickAdmitPatientButton(fullName);
  });

  await test.step('And I select the bed for admission', async () => {
    await page.getByText(`${bed.bedNumber} · Empty`).click();
  });

  await test.step('And I confirm admission by clicking "Admit"', async () => {
    await page.getByRole('button', { name: 'Admit', exact: true }).click();
  });

  await test.step('Then I should see a success message confirming the admission success', async () => {
    await wardPage.expectAdmissionSuccessNotification(fullName, bed.bedNumber);
  });

  await test.step('And I should see the patient in the ward view', async () => {
    await wardPage.waitForPatientInWardView(fullName);
  });

  await test.step('And I wait for the admission to be available in the API', async () => {
    await waitForAdmissionToBeProcessed(api, page, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
  });

  await test.step('And when I click on the patient card to open the patient workspace', async () => {
    await wardPage.clickPatientCard(fullName);
  });

  await test.step('Then I click the "Patient note" button in the siderail to open the patient note workspace', async () => {
    await wardPage.clickPatientNotesButton();
  });

  await test.step('And when I record a patient note', async () => {
    await wardPage.fillWardAdmissionNote('Sample patient note');
  });

  await test.step('And I submit the form by clicking the "Save" button', async () => {
    await wardPage.clickSaveButton();
  });

  await test.step('Then I should see a success message confirming the note was saved', async () => {
    await expect(page.getByText(/patient note saved/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await dischargePatientFromBed(api, bed.id, wardPatient.uuid);
  await retireBedType(api, bedType.uuid, 'Retired during automated testing');
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});
