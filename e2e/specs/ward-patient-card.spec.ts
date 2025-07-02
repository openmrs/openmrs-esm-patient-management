import { expect } from '@playwright/test';
import { test } from '../core';
import { ChartPage } from '../pages';
import { type Patient } from '../types';
import { generateRandomPatient, deletePatient, changeToWardLocation, startVisit } from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { WARD_NAME, CANCEL_REASON, CANCEL_SUCCESS_MESSAGE, FORM_SUCCESS_MESSAGE } from '../Config/config';

let visit: Visit;
let wardPatient: Patient;

test.beforeEach(async ({ api }) => {
  await changeToWardLocation(api);
  wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
  visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
});

test('Complete admission request lifecycle: create, verify, and cancel', async ({ page }) => {
  const chartPage = new ChartPage(page);
  const patientFullName = wardPatient.person?.display;

  await test.step('When I visit the patient chart summary page', async () => {
    await chartPage.goTo(wardPatient.uuid);
    // await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(new RegExp(wardPatient.uuid));
    await page.getByRole('heading', { name: 'Vitals' }).waitFor({ state: 'visible' }); //It loads last
  });

  await test.step('And I click the `Clinical forms` button on the siderail', async () => {
    await page.getByLabel(/clinical forms/i, { exact: true }).click();
    await page.waitForLoadState('load');
  });

  await test.step('Then I should see the clinical forms workspace', async () => {
    await expect(page.getByText(/ward admission/i).first()).toBeVisible();
  });

  await test.step('When I click the `ward admission` link to launch the form', async () => {
    await page.getByText(/ward admission/i).click();
    await page.waitForLoadState('load');
  });

  await test.step('Then I should see the `ward admission` form launch in the workspace', async () => {
    const dispositionGroup = page.getByRole('group', { name: 'Inpatient patient disposition' });
    await dispositionGroup.waitFor({ state: 'visible' });
  });

  await test.step('And I select Inpatient Ward at Admitted to Location', async () => {
    await page.getByRole('group', { name: 'Inpatient patient disposition' }).locator('span').nth(2).click();
    await page.getByRole('button', { name: 'Open' }).click();
    await page.getByRole('option', { name: WARD_NAME }).locator('div').click();
  });

  await test.step('And I click on the `Save` button', async () => {
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await test.step('Then I should see a success notification', async () => {
    await expect(page.getByText(FORM_SUCCESS_MESSAGE)).toBeVisible();
  });

  await test.step('When I change to the inpatient ward location', async () => {
    const changeLocationButton = page.getByRole('button', { name: 'Change location' });
    await changeLocationButton.click();
    await page.getByText(WARD_NAME, { exact: true }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    await expect(page.getByRole('button', { name: 'Confirm' })).toBeHidden();
  });

  await test.step('Then I visit the ward management page', async () => {
    await page.getByRole('link', { name: 'OpenMRS Logo' }).click();
    await page.waitForLoadState('load');
    await page.getByRole('link', { name: 'Wards' }).click();
    await page.waitForLoadState('load');
  });

  await test.step('And I should see the patient in the admission request list', async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
    await expect(page.getByText(patientFullName)).toBeVisible();
  });

  await test.step('When I click the `Cancel` button for the admission request', async () => {
    await page.getByRole('button', { name: 'Cancel' }).first().click();
  });

  await test.step('And I provide a cancellation reason', async () => {
    await page.getByRole('heading', { name: 'Clinical notes' }).click();
    await page.getByRole('textbox').fill(CANCEL_REASON);
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await test.step('Then I should see a cancellation success message', async () => {
    await expect(page.getByText(CANCEL_SUCCESS_MESSAGE)).toBeVisible();
  });

  await test.step('And the patient should be removed from the admission request list', async () => {
    await expect(page.getByText(patientFullName)).toBeHidden();
  });
});

test.afterEach(async ({ api }) => {
  if (wardPatient?.uuid) {
    await deletePatient(api, wardPatient.uuid);
  }
});
