import { expect } from '@playwright/test';
import { startVisit, getPatientIdentifierStr } from '../commands';
import { test } from '../core';
import { ServiceQueuesPage } from '../pages';

test.describe('O3-5362: Active Visit Status Not Updating After Starting Visit', () => {
  test('Should update visit status and hide Start Visit button after creating a visit', async ({
    api,
    page,
    patient,
  }) => {
    const serviceQueuesPage = new ServiceQueuesPage(page);
    const firstName = patient.person.display.split(' ')[0];
    const lastName = patient.person.display.split(' ')[1];

    await test.step('Navigate to the service queues page', async () => {
      await serviceQueuesPage.goto();
    });

    await test.step('Click on Add patient to queue button', async () => {
      await page.getByRole('button', { name: 'Add patient to queue', exact: true }).click();
    });

    await test.step('Search for a patient without an active visit', async () => {
      await page.getByTestId('patientSearchBar').click();
      await page.getByTestId('patientSearchBar').fill(getPatientIdentifierStr(patient));
    });

    await test.step('Patient should appear in search results with Start Visit button', async () => {
      await expect(page.getByRole('button', { name: `${firstName} ${lastName} Male` })).toBeVisible();
    });

    await test.step('Start a visit for the patient using the API', async () => {
      // Use the API helper to start a visit
      await startVisit(api, patient.uuid);
    });

    await test.step('Click on the patient to open the workspace', async () => {
      await page.getByRole('button', { name: `${firstName} ${lastName} Male` }).click();
    });

    await test.step('Wait for polling to detect the new visit and verify queue entry form is shown', async () => {
      // Our polling interval is 3 seconds, so the UI should update within ~6 seconds
      // Wait for the queue location dropdown to appear, which indicates the visit was detected
      await expect(page.getByText('Queue Location', { exact: true })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText('A visit is required to add patient to queue')).toBeHidden();
    });

    await test.step('Fill out and submit the queue entry form', async () => {
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

    await test.step('Verify queue entry was added successfully', async () => {
      await expect(page.getByText(/Queue entry added successfully/i)).toBeVisible();
      await expect(page.getByRole('link', { name: `${firstName} ${lastName}` })).toBeVisible();
    });
  });
});
