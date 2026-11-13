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

test.describe('Starting a visit from the search overlay', () => {
  test('Start a visit for a patient without an active visit', async ({ page, patient }) => {
    const { firstName, fullName } = getPatientNames(patient);
    const searchPage = new PatientSearchPage(page);

    await test.step('Given I search for a patient who has no active visit', async () => {
      await searchPage.goto(fullName);
      await expect(searchPage.patientResultLink(firstName)).toBeVisible();
    });

    await test.step('When I click the start visit button on the search result', async () => {
      await searchPage.startVisitButton().click();
    });

    await test.step('Then the visit form opens, in front of the hidden search overlay', async () => {
      await expect(searchPage.visitFormStartButton()).toBeVisible();
      await expect(searchPage.overlayHeader()).toBeHidden();
    });

    await test.step('When I fill in and submit the visit form', async () => {
      await searchPage.startVisitInVisitForm();
    });

    await test.step('Then the visit starts', async () => {
      await expect(page.getByText(/visit started successfully/i)).toBeVisible();
    });
  });

  test('Go back to the search results after discarding the visit form', async ({ page, patient }) => {
    const { firstName, fullName } = getPatientNames(patient);
    const searchPage = new PatientSearchPage(page);

    await test.step('Given I opened the visit form from a search result', async () => {
      await searchPage.goto(fullName);
      await searchPage.startVisitButton().click();
      await expect(searchPage.visitFormStartButton()).toBeVisible();
    });

    await test.step('When I discard the visit form', async () => {
      await searchPage
        .visitForm()
        .getByRole('button', { name: /discard/i })
        .click();
    });

    await test.step('Then the search overlay comes back with the same results', async () => {
      await expect(searchPage.visitFormStartButton()).toBeHidden();
      await expect(searchPage.overlayHeader()).toBeVisible();
      await expect(searchPage.resultsCount(1)).toBeVisible();
      await expect(searchPage.patientResultLink(firstName)).toBeVisible();
    });
  });
});
