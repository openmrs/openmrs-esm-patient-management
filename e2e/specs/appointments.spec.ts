import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, type Patient, startVisit, endVisit } from '../commands';
import { test } from '../core';
import { AppointmentsPage } from '../pages';
import { type Visit } from '@openmrs/esm-framework';

let patient: Patient;
let visit: Visit;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
});

test('Add, edit and cancel an appointment', async ({ page, api }) => {
  const appointmentsPage = new AppointmentsPage(page);

  await test.step('When I go to the appointment tab in the patient chart', async () => {
    await appointmentsPage.goto(patient.uuid);
  });

  await test.step('And I click on the “Add” button', async () => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
  });

  // FIXME: Login locations are failing to populate in this dropdown in the test environment
  // await test.step('And I select Mobile Clinic location', async () => {
  //   await page.getByLabel('Select location').selectOption('Mobile Clinic');
  // });

  await test.step('And I select “Outpatient Department” service', async () => {
    await page.selectOption('select#service', { label: 'Outpatient Department' });
  });

  await test.step('And I fill in an appointment date in the `Date appointment issued` field', async () => {
    await page.getByLabel('Date appointment issued').fill(new Date().toLocaleDateString('en-GB'));
  });

  await test.step('And I make appointment as “Scheduled”', async () => {
    await page.getByLabel('Select an appointment type').selectOption('Scheduled');
  });

  await test.step('And I set date for tomorrow', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByRole('textbox', { name: /^Date$/i }).fill(tomorrow.toLocaleDateString('en-GB'));
  });

  await test.step('And I set the “Duration” to 60', async () => {
    await page.getByLabel('Duration (minutes)').fill('60');
  });

  await test.step('And I add a note', async () => {
    await page
      .getByPlaceholder(/write any additional points here/i)
      .fill('A sample note for testing out the appointment scheduling flow');
  });

  await test.step('And I click Save button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText(/appointment scheduled/i)).toBeVisible();
  });

  await test.step('When I click the overflow menu on the table row with the newly created appointment', async () => {
    await page.getByRole('button', { name: 'Options' }).click();
  });

  await test.step('And I choose the "Edit" option from the popup menu', async () => {
    await page.getByRole('menuitem', { name: 'Edit' }).click();
  });

  await test.step('When I change to “Inpatient ward” location', async () => {
    await page.selectOption('select#service', { label: 'General Medicine service' });
  });

  await test.step('And I change to “General Medicine” Service', async () => {
    await page.getByLabel('Select a service').selectOption('General Medicine service');
  });

  await test.step('And I change the date to Today', async () => {
    const today = new Date();
    today.setDate(today.getDate());
    await page.fill('input[placeholder="dd/mm/yyyy"]', today.toLocaleDateString('en-GB'));
  });

  await test.step('And I set the “Duration” of the appointment”', async () => {
    await page.getByLabel('Duration (minutes)').fill('80');
  });

  await test.step('And I change the note', async () => {
    await page
      .getByPlaceholder('Write any additional points here')
      .fill('A sample note for testing out the edit flow for scheduled appointments');
  });

  await test.step('And I click Save button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText(/appointment edited/i)).toBeVisible();
  });

  await test.step('When I click the "Today" tab', async () => {
    await page.getByRole('tab', { name: /today/i }).click();
  });

  await test.step('Then I click the options kebab menu in the appointment', async () => {
    await page.getByRole('button', { name: 'Options' }).click();
  });

  await test.step('And I choose the "Cancel" option ', async () => {
    await page.getByRole('menuitem', { name: 'Cancel' }).click();
  });

  await test.step('When I click the "Cancel appointment" button to confirm', async () => {
    await page.getByRole('button', { name: 'danger Cancel appointment' }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText(/appointment cancelled successfully/i)).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
