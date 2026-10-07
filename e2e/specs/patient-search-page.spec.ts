import { expect } from '@playwright/test';
import { test } from '../core';
import { HomePage, PatientSearchPage } from '../pages';
import { getPatientIdentifierStr, getPatientNames } from '../commands';

test('Search for a patient from the dedicated search page', async ({ page, patient }) => {
  const openmrsIdentifier = getPatientIdentifierStr(patient);
  const { firstName, lastName, fullName } = getPatientNames(patient);
  const homePage = new HomePage(page);
  const searchPage = new PatientSearchPage(page);

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step('And I enter the patient name into the navbar search field', async () => {
    await homePage.searchPatient(fullName);
  });

  await test.step('And I press Enter to go to the search results page', async () => {
    await homePage.patientSearchBar().press('Enter');
  });

  await test.step('Then I should be on the dedicated search page with the query carried over', async () => {
    await expect(page).toHaveURL(new RegExp(`/spa/search\\?query=${firstName}(%20|\\+)${lastName}`));
  });

  await test.step('And I should see exactly one search result for the patient', async () => {
    await expect(searchPage.resultsCount(1)).toBeVisible();
    await expect(searchPage.patientResultLink(firstName)).toBeVisible();
    await expect(page.getByText(new RegExp(openmrsIdentifier))).toBeVisible();
  });

  await test.step('When I click on the patient result', async () => {
    await searchPage.patientResultLink(firstName).click();
  });

  await test.step("Then I should be redirected to the patient's chart page", async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/patient-summary`);
  });
});

test('Refine patient search results by sex and year of birth', async ({ page, patient }) => {
  const { firstName, fullName } = getPatientNames(patient);
  const searchPage = new PatientSearchPage(page);

  await test.step('When I visit the search page directly with a query for the patient', async () => {
    await searchPage.goto(fullName);
  });

  await test.step('Then I should see exactly one search result for the patient', async () => {
    await expect(searchPage.resultsCount(1)).toBeVisible();
    await expect(searchPage.patientResultLink(firstName)).toBeVisible();
  });

  await test.step('When I filter by a sex that does not match the patient', async () => {
    await searchPage.sexFilterTab('Female').click();
    await searchPage.applyFiltersButton().click();
  });

  await test.step('Then I should see no matching patients', async () => {
    await expect(searchPage.noMatchingFiltersMessage()).toBeVisible();
    await expect(searchPage.patientResultLink(firstName)).toBeHidden();
  });

  await test.step('When I filter by the sex that matches the patient', async () => {
    await searchPage.sexFilterTab('Male').click();
    await searchPage.applyFiltersButton().click();
  });

  await test.step('Then I should see the patient in the results again', async () => {
    await expect(searchPage.resultsCount(1)).toBeVisible();
    await expect(searchPage.patientResultLink(firstName)).toBeVisible();
  });

  await test.step('When I additionally filter by a year of birth that does not match the patient', async () => {
    await searchPage.yearOfBirthInput().fill('2019');
    await searchPage.applyFiltersButton().click();
  });

  await test.step('Then I should see no matching patients', async () => {
    await expect(searchPage.noMatchingFiltersMessage()).toBeVisible();
  });

  await test.step('When I reset the search filters', async () => {
    await searchPage.resetFiltersButton().click();
  });

  await test.step('Then I should see the patient in the results again', async () => {
    await expect(searchPage.resultsCount(1)).toBeVisible();
    await expect(searchPage.patientResultLink(firstName)).toBeVisible();
  });
});
