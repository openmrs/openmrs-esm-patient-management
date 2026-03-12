import { expect } from '@playwright/test';
import {
  createPatientWithOrderedLabOrdersAndBedAssignment,
  cleanupLabOrderWithBed,
  changeToWardLocation,
} from '../commands';
import { test } from '../core';
import { WardPage } from '../pages';

test.describe('Lab Orders on Patient Card', () => {
  let generatedData: any;

  test.beforeEach(async ({ api }) => {
    await changeToWardLocation(api);
    generatedData = await createPatientWithOrderedLabOrdersAndBedAssignment(api);
  });

  test('should display lab orders warning banner on the patient card in the Ward App', async ({ page }) => {
    const wardPage = new WardPage(page);
    const patientName = generatedData.patient.person.display;
    const bedNumber = generatedData.bed.bedNumber;

    await test.step('When the user navigates to the Ward App', async () => {
      await wardPage.goTo();
      await expect(page.getByRole('heading', { name: /inpatient ward/i })).toBeVisible();
    });

    await test.step('And admits the patient from the admission requests list', async () => {
      await wardPage.clickManageAdmissionRequests();
      await wardPage.waitForAdmissionRequest(patientName);
      await wardPage.clickAdmitPatientButton(patientName);
      await wardPage.selectBedByLabel(`${bedNumber} · Empty`);
      await wardPage.clickAdmitButton();
      await wardPage.expectAdmissionSuccessNotification(patientName, bedNumber);
    });

    await test.step('Then the lab orders banner should be visible on the patient card', async () => {
      const patientCard = page.locator(`[class*="wardPatientCard"]:has-text("${patientName}")`).first();
      await patientCard.waitFor({ state: 'visible' });
      await expect(patientCard.getByText('1 Labs')).toBeVisible();
    });
  });

  test.afterEach(async ({ api }) => {
    if (generatedData) {
      await cleanupLabOrderWithBed(api, {
        orderUuid: generatedData.order.uuid,
        labEncounterUuid: generatedData.labEncounter.uuid,
        admissionEncounterUuid: generatedData.admissionEncounter.uuid,
        visitUuid: generatedData.visit.uuid,
        patientUuid: generatedData.patient.uuid,
        bedUuid: generatedData.bed.uuid,
        bedTypeUuid: generatedData.bedType.uuid,
      });
    }
  });
});
