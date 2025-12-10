import { expect } from '@playwright/test';
import { test } from '../core';
import {
  changeToWardLocation,
  deletePatient,
  endVisit,
  generateRandomPatient,
  generateWardAdmission,
  getProvider,
  startVisit,
} from '../commands';
import { type Visit } from '@openmrs/esm-framework';
import { type Bed, type BedType, type Patient, type Provider } from '../commands/types';
import { dischargePatientFromBed, generateBedType, generateRandomBed, retireBedType } from '../commands/bed-operations';
import { WardPage } from '../pages';

let bed: Bed;
let invalidBed: Bed;
let bedtype: BedType;
let provider: Provider;
let visit: Visit;
let wardPatient: Patient;
let invalidLocationPatient: Patient;
let invalidLocationVisit: Visit;

test.describe('Ward Admission Location Validation', () => {
  test.beforeEach(async ({ api }) => {
    // Setup for valid location scenario
    await changeToWardLocation(api);
    bedtype = await generateBedType(api);
    bed = await generateRandomBed(api, bedtype);
    provider = await getProvider(api);

    // Create patient with valid visit at ward location
    wardPatient = await generateRandomPatient(api, process.env.E2E_WARD_LOCATION_UUID);
    visit = await startVisit(api, wardPatient.uuid, process.env.E2E_WARD_LOCATION_UUID);
    await generateWardAdmission(api, provider.uuid, wardPatient.uuid);

    // Create patient with visit at a different location for invalid location test
    invalidLocationPatient = await generateRandomPatient(api, process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID);
    invalidLocationVisit = await startVisit(
      api,
      invalidLocationPatient.uuid,
      process.env.E2E_LOGIN_DEFAULT_LOCATION_UUID,
    );
    await generateWardAdmission(api, provider.uuid, invalidLocationPatient.uuid);

    // Create a bed at the invalid location for testing
    invalidBed = await generateRandomBed(api, bedtype);
  });

  test('should display warning when attempting to admit patient to invalid location', async ({ page }) => {
    const fullName = invalidLocationPatient.person?.display;
    const wardPage = new WardPage(page);

    await test.step('When I visit the patient ward page', async () => {
      await wardPage.goTo();
    });

    await test.step('And I click the "Manage" button to view admission requests', async () => {
      await wardPage.clickManageAdmissionRequests();
    });

    await test.step('Then I verify the patient is listed in admission requests', async () => {
      await wardPage.waitForAdmissionRequest(fullName);
      await expect(page.getByText(fullName)).toBeVisible();
    });

    await test.step('And I click the "Admit patient" button for the patient', async () => {
      await wardPage.clickAdmitPatientButton(fullName);
    });

    await test.step('And I select a bed that is NOT a sub-location of the visit location', async () => {
      // Wait for the bed selector to be visible
      await page.getByText('Select a bed').waitFor({ state: 'visible' });

      // Select a bed from the invalid location hierarchy
      await page.getByText(`${invalidBed.bedNumber}`).click();
    });

    await test.step('Then I should see a warning notification about invalid location', async () => {
      // Verify the warning notification appears
      const warningNotification = page
        .locator('[class*="inlineNotification"]')
        .filter({ has: page.locator('[kind="warning"]') });
      await expect(warningNotification).toBeVisible();

      // Verify the warning message contains location information
      await expect(page.getByText(/selected location is not a sub-location/i)).toBeVisible();

      // Verify the warning mentions the visit location name
      await expect(page.getByText(/patient's visit location/i)).toBeVisible();
    });

    await test.step('And the submit button should be disabled', async () => {
      const admitButton = page.getByRole('button', { name: 'Admit' });
      await expect(admitButton).toBeDisabled();
    });

    await test.step('When I cancel the admission', async () => {
      await page.getByRole('button', { name: 'Cancel' }).click();
    });
  });

  test('should allow admission when valid sub-location is selected', async ({ page }) => {
    const fullName = wardPatient.person?.display;
    const wardPage = new WardPage(page);

    await test.step('When I visit the patient ward page', async () => {
      await wardPage.goTo();
    });

    await test.step('And I click the "Manage" button to view admission requests', async () => {
      await wardPage.clickManageAdmissionRequests();
    });

    await test.step('Then I verify the patient is listed in admission requests', async () => {
      await wardPage.waitForAdmissionRequest(fullName);
      await expect(page.getByText(fullName)).toBeVisible();
    });

    await test.step('And I click the "Admit patient" button for the patient', async () => {
      await wardPage.clickAdmitPatientButton(fullName);
    });

    await test.step('And I select a bed that IS a sub-location of the visit location', async () => {
      // Wait for the bed selector to be visible
      await page.getByText('Select a bed').waitFor({ state: 'visible' });

      // Select a valid bed from the same location hierarchy
      await page.getByText(`${bed.bedNumber} · Empty`).click();
    });

    await test.step('Then no warning notification should appear', async () => {
      // Verify no warning notification is visible
      const warningNotification = page
        .locator('[class*="inlineNotification"]')
        .filter({ has: page.locator('[kind="warning"]') });
      await expect(warningNotification).toBeHidden();
    });

    await test.step('And the submit button should be enabled', async () => {
      const admitButton = page.getByRole('button', { name: 'Admit' });
      await expect(admitButton).toBeEnabled();
    });

    await test.step('When I confirm admission by clicking "Admit"', async () => {
      await page.getByRole('button', { name: 'Admit' }).click();
    });

    await test.step('Then I should see a success message confirming the admission', async () => {
      await wardPage.expectAdmissionSuccessNotification(fullName, bed.bedNumber);
    });
  });

  test.afterEach(async ({ api }) => {
    // Clean up valid location patient
    if (bed && wardPatient) {
      await dischargePatientFromBed(api, bed.id, wardPatient.uuid);
    }
    if (wardPatient) {
      await deletePatient(api, wardPatient.uuid);
    }
    if (visit) {
      await endVisit(api, visit.uuid, true);
    }

    // Clean up invalid location patient
    if (invalidLocationPatient) {
      await deletePatient(api, invalidLocationPatient.uuid);
    }
    if (invalidLocationVisit) {
      await endVisit(api, invalidLocationVisit.uuid, true);
    }

    // Clean up beds and bed type
    if (bedtype) {
      await retireBedType(api, bedtype.uuid, 'Retired during automated testing');
    }
  });
});
