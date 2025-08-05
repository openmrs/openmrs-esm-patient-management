import { expect } from '@playwright/test';
import { test } from '../core';
import { PatientChartPage } from '../pages';
import { endVisit, startVisit, changeToWardLocation, generateRandomPatient, deletePatient } from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Patient } from '../commands/types';

let visit: Visit;
let wardPatient: Patient;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
});

test('Add a patient to the admission request list', async ({ page }) => {
  const chartPage = new PatientChartPage(page);
  const fullName = wardPatient.person?.display;

  await test.step('When I visit the chart summary page', async () => {
    await chartPage.goTo(wardPatient.uuid);
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i, { exact: true }).click();
  });

  await test.step('Then I should see the clinical forms workspace', async () => {
    const headerRow = chartPage.formsTable().locator('thead > tr');

    await expect(page.getByPlaceholder(/search this list/i)).toBeVisible();
    await expect(headerRow).toContainText(/form name \(a-z\)/i);
    await expect(headerRow).toContainText(/last completed/i);

    await expect(page.getByRole('cell', { name: 'Covid 19', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: /ward admission/i, exact: true })).toBeVisible();
  });

  await test.step('When I click the "Ward request" link to launch the form in the workspace', async () => {
    await page.getByText(/ward admission/i).click();
  });

  await test.step('Then I should see the "Ward request" form launch in the workspace', async () => {
    await expect(page.getByText(/ward request/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /ward details/i, exact: true })).toBeVisible();
    await expect(page.getByText(/inpatient patient disposition/i)).toBeVisible();
  });

  await test.step('And I select "Inpatient Ward" as the value of the "Admitted to Location" field', async () => {
    await page.getByRole('group', { name: 'Inpatient patient disposition' }).locator('span').nth(2).click();
    await page.getByRole('button', { name: 'Open' }).click();
    await page.getByRole('option', { name: 'Inpatient Ward' }).locator('div').click();
  });

  await test.step('And I click the "Save and close" button', async () => {
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(/form submitted successfully/i)).toBeVisible();
  });

  await test.step('Then I visit the ward page', async () => {
    await page.getByRole('link', { name: 'OpenMRS Logo' }).click();
    await page.getByRole('link', { name: 'Wards' }).click();
  });

  await test.step('And I should see the patient in the admission request list', async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
    await expect(page.getByText(fullName)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, wardPatient.uuid);
  await endVisit(api, visit.uuid, true);
});
