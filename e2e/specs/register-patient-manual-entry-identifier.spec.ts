import { type APIRequestContext, type Page, expect } from '@playwright/test';
import { test } from '../core';
import { deletePatient } from '../commands';
import { RegistrationAndEditPage } from '../pages';

const PATIENT_CHART_URL = /\/patient\/(?<uuid>[a-f0-9-]{36})\/chart/i;
const openMrsIdTypeUuid = process.env.E2E_PATIENT_IDENTIFIER_TYPE_UUID;
let registeredPatientUuid: string;

// Turns on manual entry for the OpenMRS ID auto-generation option in this page only. Changing the option on the
// server would affect other specs that run at the same time.
async function enableManualEntryForOpenMrsId(page: Page) {
  await page.route(/\/idgen\/autogenerationoption/, async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    body.results = body.results.map((option) =>
      option.identifierType?.uuid === openMrsIdTypeUuid ? { ...option, manualEntryEnabled: true } : option,
    );
    await route.fulfill({ response, json: body });
  });
}

async function generateOpenMrsId(api: APIRequestContext) {
  const response = await api.post(
    `idgen/identifiersource/${process.env.E2E_PATIENT_IDENTIFIER_SOURCE_UUID}/identifier`,
    {
      data: {},
    },
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()).identifier as string;
}

async function getOpenMrsId(api: APIRequestContext, patientUuid: string) {
  const response = await api.get(`patient/${patientUuid}/identifier?v=custom:(identifier,identifierType:(uuid))`);
  const { results } = await response.json();
  return results.find((identifier) => identifier.identifierType.uuid === openMrsIdTypeUuid)?.identifier as string;
}

async function fillRequiredDemographics(registrationPage: RegistrationAndEditPage) {
  await registrationPage.givenNameInput().fill('Manual');
  await registrationPage.familyNameInput().fill('Entry');
  await registrationPage.sexRadioButton('female').check();
  await registrationPage.birthdateDayInput().fill('15');
  await registrationPage.birthdateMonthInput().fill('06');
  await registrationPage.birthdateYearInput().fill('1990');
}

const openMrsIdInput = (page: Page) => page.locator('[id="identifiers.openMrsId.identifierValue"]');
const openMrsIdEditButton = (page: Page) => page.getByTestId('edit-button');

test.beforeEach(async ({ page }) => {
  await enableManualEntryForOpenMrsId(page);
});

test.afterEach(async ({ api }) => {
  if (registeredPatientUuid) {
    await deletePatient(api, registeredPatientUuid);
    registeredPatientUuid = undefined;
  }
});

test('Register a patient without typing an OpenMRS ID that allows manual entry', async ({ page, api }) => {
  test.slow();
  const registrationPage = new RegistrationAndEditPage(page);

  await test.step('When I visit the registration page', async () => {
    await registrationPage.goto();
    await registrationPage.waitUntilTheFormIsLoaded();
  });

  await test.step('And I fill in the required patient demographics', async () => {
    await fillRequiredDemographics(registrationPage);
  });

  await test.step('Then the OpenMRS ID shows as auto-generated', async () => {
    await expect(page.getByTestId('identifier-placeholder')).toHaveText(/auto-generated/i);
  });

  await test.step('When I click the `Register patient` button', async () => {
    await registrationPage.createPatientButton().click();
  });

  await test.step('Then the patient is registered with a generated OpenMRS ID', async () => {
    await expect(page.getByText(/new patient created/i)).toBeVisible();
    await page.waitForURL(PATIENT_CHART_URL);
    registeredPatientUuid = page.url().match(PATIENT_CHART_URL).groups.uuid;

    const openMrsId = await getOpenMrsId(api, registeredPatientUuid);
    expect(openMrsId).toBeTruthy();
    expect(openMrsId).not.toBe('auto-generated');
  });
});

test('Register a patient with a typed OpenMRS ID that allows manual entry', async ({ page, api }) => {
  test.slow();
  const registrationPage = new RegistrationAndEditPage(page);
  const typedId = await generateOpenMrsId(api);

  await test.step('When I visit the registration page', async () => {
    await registrationPage.goto();
    await registrationPage.waitUntilTheFormIsLoaded();
  });

  await test.step('And I fill in the required patient demographics', async () => {
    await fillRequiredDemographics(registrationPage);
  });

  await test.step(`And I click the OpenMRS ID edit button and type ${typedId}`, async () => {
    await openMrsIdEditButton(page).click();
    await openMrsIdInput(page).fill(typedId);
  });

  await test.step('And I click the `Register patient` button', async () => {
    await registrationPage.createPatientButton().click();
  });

  await test.step('Then the patient is registered with the typed OpenMRS ID', async () => {
    await expect(page.getByText(/new patient created/i)).toBeVisible();
    await page.waitForURL(PATIENT_CHART_URL);
    registeredPatientUuid = page.url().match(PATIENT_CHART_URL).groups.uuid;

    expect(await getOpenMrsId(api, registeredPatientUuid)).toBe(typedId);
  });
});

test("Change a patient's OpenMRS ID that allows manual entry", async ({ page, api, patient }) => {
  test.slow();
  const editPage = new RegistrationAndEditPage(page);
  const savedId = await getOpenMrsId(api, patient.uuid);
  const newId = await generateOpenMrsId(api);

  await test.step("When I visit the edit page of a patient's details", async () => {
    await editPage.goto(patient.uuid);
    await editPage.waitUntilTheFormIsLoaded();
  });

  await test.step('And I click the OpenMRS ID edit button and clear the value', async () => {
    await openMrsIdEditButton(page).click();
    await expect(openMrsIdInput(page)).toHaveValue(savedId);
    await openMrsIdInput(page).clear();
  });

  await test.step('And I click the `Update patient` button', async () => {
    await editPage.createPatientButton().click();
  });

  await test.step('Then the OpenMRS ID is required and the saved value is kept', async () => {
    await expect(page.getByText(/identifier value is required/i)).toBeVisible();
    expect(await getOpenMrsId(api, patient.uuid)).toBe(savedId);
  });

  await test.step(`When I type ${newId} and click the \`Update patient\` button`, async () => {
    await openMrsIdInput(page).fill(newId);
    await editPage.createPatientButton().click();
  });

  await test.step('Then the patient is saved with the new OpenMRS ID', async () => {
    await page.waitForURL(PATIENT_CHART_URL);
    expect(await getOpenMrsId(api, patient.uuid)).toBe(newId);
  });
});
