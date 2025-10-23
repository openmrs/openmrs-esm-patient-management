import { expect } from '@playwright/test';
import { startVisit, getPatientIdentifierStr } from '../commands';
import { test } from '../core';
import { ServiceQueuesPage } from '../pages';

test('Add patient with visit to queue', async ({ api, page, patient }) => {
  await startVisit(api, patient.uuid);
  const serviceQueuesPage = new ServiceQueuesPage(page);
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];

  await test.step('When I go to the Appointments page in the patient chart', async () => {
    await serviceQueuesPage.goto();
  });

  await test.step('And I click on the “Add patient to queue” button', async () => {
    await page.getByRole('button', { name: 'Add patient to queue', exact: true }).click();
  });

  await test.step('And I search for the patient', async () => {
    await page.getByTestId('patientSearchBar').click();
    await page.getByTestId('patientSearchBar').fill(getPatientIdentifierStr(patient));
  });

  await test.step('Then the patient should appear in search result', async () => {
    await expect(page.getByRole('button', { name: `${firstName} ${lastName} Male` })).toBeVisible();
  });

  await test.step('When I click on the patient', async () => {
    await page.getByRole('button', { name: `${firstName} ${lastName} Male` }).click();
  });

  await test.step('Then I should be in the "add patient to queue" form', async () => {
    await expect(page.getByText('Queue Location', { exact: true })).toBeVisible();
  });

  await test.step('When I click on the "Back to search results" button', async () => {
    await page.getByRole('button', { name: 'Back to search results' }).click();
  });

  await test.step('Then the patient should appear in search result again', async () => {
    await expect(page.getByRole('button', { name: `${firstName} ${lastName} Male` })).toBeVisible();
  });

  await test.step('When I click on the patient', async () => {
    await page.getByRole('button', { name: `${firstName} ${lastName} Male` }).click();
  });

  await test.step('When I fill out the form and submit', async () => {
    await page
      .getByRole('group', { name: 'Queue Location' })
      .getByLabel('')
      .selectOption('44c3efb0-2583-4c80-a79e-1f756a03c0a1');
    await page
      .getByRole('group', { name: 'Service' })
      .getByLabel('')
      .selectOption('13b656d3-e141-11ee-bad2-0242ac120002');
    await page.locator('#omrs-workspaces-container').getByRole('button', { name: 'Add patient to queue' }).click();
  });

  await test.step('Then I should see a success message and see the patient in the queue table', async () => {
    await expect(page.getByText(/Queue entry added successfully/i)).toBeVisible();
    await expect(page.getByRole('link', { name: `${firstName} ${lastName}` })).toBeVisible();
  });
});
