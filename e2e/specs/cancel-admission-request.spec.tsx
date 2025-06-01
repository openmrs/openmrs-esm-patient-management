import { test } from '../core';
import { expect } from '@playwright/test';
import { type Patient } from '../types';
import { generateRandomPatient } from '../commands';
let patient: Patient;
let console:Console;
test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});
test('Cancel Admission Request and verify removal from the list', async ({ page }) => {
  await test.step('Should be in the Inpatient location',async()=>{
 await page.goto('http://localhost:8080/openmrs/spa/home/ward');
await page.getByRole('button', { name: 'Change location' }).click();
await page.locator('label').filter({ hasText: 'Inpatient Ward' }).locator('span').first().click();
await page.getByRole('button', { name: 'Confirm' }).click();  
  });
 await test.step('Open Admission Requests list', async () => {
    await page.getByRole('button', { name: 'Manage' }).click();
  });

  await test.step('Verify patient is in the admission request list', async () => {
  const card = page.locator('.-esm-ward__admission-request-card__admissionRequestCard___ArwhY').first();
  await expect(card).toBeVisible();
  });

  await test.step('Cancel the admission request', async () => {
    await page.locator('button').filter({ hasText: 'Cancel' }).first().click();
   
  });

  await test.step('Enter cancellation reason and save', async () => {
    await page.getByRole('heading', { name: 'Clinical notes' }).click();
    await page.getByRole('textbox').click();
    await page.getByRole('textbox').fill('Has been taken by the family members');
    await page.getByRole('button', { name: 'Save' }).click();
  });

  await test.step('Verify cancellation success message', async () => {
    await page.waitForSelector('text=Admission request cancelled.',{state:'visible'});
    await expect(page.getByText('Admission request cancelled.')).toBeVisible();
  });

  await test.step('Ensure the patient is no longer in the request list', async () => {
    await expect(page.getByText(patient.person.display)).not.toBeVisible();
  });
});


test.afterEach(async ({ api }) => {
  console.log(`Test cleanup complete for patient: ${patient.uuid}`);

});
