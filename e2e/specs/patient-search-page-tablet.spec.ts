import { expect } from '@playwright/test';
import { test } from '../core';
import { HomePage, PatientSearchPage } from '../pages';
import { getPatientNames } from '../commands';

// In the tablet layout (601px - 1023px wide), patient search is rendered as a full-screen overlay instead of
// as the search page's results column or the navbar's dropdown. The overlay has to behave like the desktop page.
test.use({ viewport: { width: 800, height: 1100 } });

test('Search for a patient in the overlay of the search page', async ({ page, patient }) => {
  const { firstName, fullName } = getPatientNames(patient);
  const searchPage = new PatientSearchPage(page);

  await test.step('When I visit the search page with a query for the patient', async () => {
    await searchPage.goto(fullName);
  });

  await test.step('Then I should see the search results in the overlay', async () => {
    await expect(searchPage.overlayHeader()).toBeVisible();
    await expect(searchPage.resultsCount(1)).toBeVisible();
    await expect(searchPage.patientResultLink(firstName)).toBeVisible();
  });

  await test.step('When I click on the patient result', async () => {
    await searchPage.patientResultLink(firstName).click();
  });

  await test.step("Then I should be redirected to the patient's chart page", async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/patient-summary`);
  });
});

test('Search for a patient from the navbar, and close the overlay by picking a result', async ({ page, patient }) => {
  const { firstName, fullName } = getPatientNames(patient);
  const homePage = new HomePage(page);
  const searchPage = new PatientSearchPage(page);

  await test.step('When I open the search overlay from the navbar on the home page, and enter the patient name', async () => {
    await homePage.goto();
    await homePage.searchPatient(fullName);
  });

  await test.step('Then I should see the patient in the overlay', async () => {
    await expect(searchPage.overlayHeader()).toBeVisible();
    await expect(searchPage.resultsCount(1)).toBeVisible();
  });

  await test.step('When I click on the patient result', async () => {
    await searchPage.patientResultLink(firstName).click();
  });

  await test.step("Then I should be on the patient's chart page, with the overlay closed", async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/patient-summary`);
    await expect(searchPage.overlayHeader()).toBeHidden();
  });
});

test('Close the search overlay with its back button', async ({ page }) => {
  const homePage = new HomePage(page);
  const searchPage = new PatientSearchPage(page);

  await test.step('When I open the search overlay from the navbar', async () => {
    await homePage.goto();
    await homePage.patientSearchIcon().click();
    await expect(searchPage.overlayHeader()).toBeVisible();
  });

  await test.step('And I click the back button', async () => {
    await searchPage.overlayCloseButton().click();
  });

  await test.step('Then the overlay closes', async () => {
    await expect(searchPage.overlayHeader()).toBeHidden();
  });
});

test('Open the chart from tablet search to start a visit', async ({ page, patient }) => {
  const { firstName, fullName } = getPatientNames(patient);
  const searchPage = new PatientSearchPage(page);

  await test.step('When I visit the search page with a query for the patient', async () => {
    await searchPage.goto(fullName);
  });

  await test.step('Then I should see the patient without a Start visit button', async () => {
    await expect(searchPage.patientResultLink(firstName)).toBeVisible();
    await expect(searchPage.startVisitButton()).toBeHidden();
  });

  await test.step('When I click on the patient result', async () => {
    await searchPage.patientResultLink(firstName).click();
  });

  await test.step("Then I should be on the patient's chart page, with the overlay closed", async () => {
    await expect(page).toHaveURL(`${process.env.E2E_BASE_URL}/spa/patient/${patient.uuid}/chart/patient-summary`);
    await expect(searchPage.overlayHeader()).toBeHidden();
  });

  await test.step('When I click Add visit in the Actions menu', async () => {
    await page.getByRole('button', { name: 'Actions', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Add visit', exact: true }).click();
  });

  await test.step('Then I should see the start visit form', async () => {
    await expect(page.getByRole('button', { name: 'Start visit', exact: true })).toBeVisible();
  });
});

test('Closing tablet search preserves an open chart workspace', async ({ page, patient }) => {
  const { fullName } = getPatientNames(patient);
  const homePage = new HomePage(page);
  const searchPage = new PatientSearchPage(page);

  await test.step("When I open the start visit form in the patient's chart, and select OPD Visit", async () => {
    await page.goto(`patient/${patient.uuid}/chart/patient-summary`);
    await page.getByRole('button', { name: 'Actions', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Add visit', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Start visit', exact: true })).toBeVisible();
    await page
      .locator('label')
      .filter({ hasText: /^OPD Visit$/ })
      .click();
  });

  await test.step('And I search for the patient from the navbar', async () => {
    await homePage.searchPatient(fullName);
  });

  await test.step('Then I should see the patient in the overlay without a Start visit button', async () => {
    await expect(searchPage.overlayHeader()).toBeVisible();
    await expect(searchPage.resultsCount(1)).toBeVisible();
    await expect(searchPage.startVisitButton()).toBeHidden();
  });

  await test.step('When I close the overlay', async () => {
    await searchPage.overlayCloseButton().click();
  });

  await test.step('Then I should see the start visit form with OPD Visit still selected', async () => {
    await expect(searchPage.overlayHeader()).toBeHidden();
    await expect(page.getByRole('button', { name: 'Start visit', exact: true })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'OPD Visit', exact: true })).toBeChecked();
  });
});
