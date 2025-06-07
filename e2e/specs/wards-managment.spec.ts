import { expect } from '@playwright/test';
import { test } from '../core';
import { WardAppPage } from '../pages';
import { type Patient } from '../types';
import { type Visit } from '@openmrs/esm-framework';
import { generateRandomPatient, deletePatient, startVisit, endVisit } from '../commands';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Adding a patient to the ward then transferring and then discharing', async ({ page }) => {
  const wardAppPage = new WardAppPage(page);

  await test.step('When I go to the Wards page', async () => {
    await wardAppPage.goto();
  });

  await test.step('And I click on the “Manage” button', async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
  });

  await test.step('And I click on the “Add Patient” button', async () => {
    await page.getByLabel('Add patient to ward').click();
  });

  await test.step('And I search for the patient', async () => {
    await page.getByPlaceholder('Search for a patient by name or identifier number').fill(patient.person.display);
  });

  await test.step('And I select the patient', async () => {
    await page.getByRole('button', { name: patient.person.display }).click();
  });

  await test.step('And I click on the “Admit patient” button', async () => {
    await page.getByRole('button', { name: 'Admit patient' }).click();
  });

  await test.step('And I click on the “Admit” button', async () => {
    await page.getByRole('button', { name: 'Admit', exact: true }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText('Patient admitted successfully', { exact: true })).toBeVisible();
  });

  await test.step('And I should see the patient in the ward page', async () => {
    await expect(page.getByText(patient.person.display)).toBeVisible();
  });

  await test.step('Then i select "Patient note" and add the note', async () => {
    await page.getByTestId(patient.uuid).click();
    await page.getByLabel('Patient note').click();
    await page.getByPlaceholder('Write any notes here').fill('Test note');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  });

  await test.step('And I should see a success message for successfully submitting the note', async () => {
    await expect(page.getByText(/patient note saved/i)).toBeVisible();
  });

  await test.step('Then I should transfer the patient to a different Ward', async () => {
    await page.getByTestId(patient.uuid).click();
    await page.getByLabel('Transfers').click();
    await page.getByPlaceholder('Search locations').fill('Inpatient Ward');
    await page.getByText('Inpatient Ward').click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
  });

  await test.step('And I should see a success message for creating transfer request of the patient', async () => {
    await expect(page.getByText(/patient transfer request created/i)).toBeVisible();
  });

  await test.step('Then I should change the location to Inpatient', async () => {
    await page.getByLabel('Change location').click();
    await page.getByPlaceholder('Search for a location').fill('Inpatient Ward');
    await page.getByText('Inpatient Ward').click();
    await page.getByRole('button', { name: 'Confirm' }).click();
  });

  await test.step('And I should see a success message for changing the location of the patient', async () => {
    await expect(page.getByText(/Location updated/i)).toBeVisible();
  });

  await test.step('Then I should accept the patient admission request in the Inpatient Ward', async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
    await page.getByRole('button', { name: 'Transfer patient', exact: true }).click();
  });

  await test.step('And I should see the success message and the patient in the Inpatient Ward', async () => {
    await expect(page.getByText('Patient admitted successfully')).toBeVisible();
    await expect(page.getByText(patient.person.display)).toBeVisible();
  });

  await test.step('Then I should change the location and accept the admin request', async () => {
    await page.getByTestId(patient.uuid).click();
    await page.getByLabel('Discharge').click();
    await page.getByRole('button', { name: 'Proceed with patient discharge' }).click();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
