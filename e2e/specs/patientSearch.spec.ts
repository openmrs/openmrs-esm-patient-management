import { test } from '../core';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';
import { generateRandomPatient, deletePatient, Patient } from '../commands';

let patient: Patient;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
});

test('Search patient by patient identifier', async ({ page, api }) => {
  // extract details from the created patient
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];
  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter a valid patient identifier into the search field', async () => {
    await homePage.searchPatient(openmrsIdentifier);
  });

  await test.step('Then I should see only the patient with the entered identifier', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(/1 search results/);
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(openmrsIdentifier));
  });

  await test.step('When I click on the patient', async () => {
    await homePage.clickOnPatientResult(firstName);
  });

  await test.step("Then I should be in the patient's chart page", async () => {
    await expect(homePage.page).toHaveURL(
      `${process.env.E2E_UI_BASE_URL}patient/${patient.uuid}/chart/Patient Summary`,
    );
  });
});

test('Search patient by full name', async ({ page, api }) => {
  // extract details from the created patient
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];

  const homePage = new HomePage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter a valid patient name into the search field', async () => {
    await homePage.searchPatient(`${firstName} ${lastName}`);
  });

  await test.step('Then I should see only the patient with the entered name', async () => {
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(/1 search results/);
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(firstName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(lastName));
    await expect(homePage.floatingSearchResultsContainer()).toHaveText(new RegExp(openmrsIdentifier));
  });

  await test.step('When I click on the patient', async () => {
    await homePage.clickOnPatientResult(openmrsIdentifier);
  });

  await test.step("Then I should be in the patient's chart page", async () => {
    await expect(homePage.page).toHaveURL(
      `${process.env.E2E_UI_BASE_URL}patient/${patient.uuid}/chart/Patient Summary`,
    );
  });
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
});
