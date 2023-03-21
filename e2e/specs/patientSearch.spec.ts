import { test } from '../core';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('should be able to search patients by identifier', async ({ page }) => {
  // extract details from the created patient
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];

  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.searchPatient(openmrsIdentifier);

  await expect(homePage.floatingSearchResultsContainer()).toHaveText(/1 search result/);
  await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
  await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));

  await homePage.clickOnPatientResult(firstName);
  await expect(homePage.page).toHaveURL(
    `${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`,
  );
});

test('should be able to search patients by name', async ({ page }) => {
  // extract details from the created patient
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];

  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.searchPatient(`${firstName} ${lastName}`);

  await expect(homePage.floatingSearchResultsContainer()).toHaveText(/1 search result/);
  await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(openmrsIdentifier));

  await homePage.clickOnPatientResult(openmrsIdentifier);
  await expect(homePage.page).toHaveURL(
    `${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/Patient Summary`,
  );
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
