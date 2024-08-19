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

test('Add an appointment', async ({ page, api }) => {
  const appointmentsPage = new AppointmentsPage(page);

  await test.step('When I go to the Appointments page in the patient chart', async () => {
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

  await test.step('And I make appointment as “Scheduled”', async () => {
    await page.getByLabel('Select an appointment type').selectOption('Scheduled');
  });

  await test.step('And I set date for tomorrow', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await page.getByLabel(/^Date$/i).fill(tomorrow.toLocaleDateString('en-GB'));
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
});

test.afterEach(async ({ api }) => {
  await endVisit(api, visit.uuid);
  await deletePatient(api, patient.uuid);
});
