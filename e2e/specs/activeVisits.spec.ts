import { test } from '../core';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';
import { createEncounter, deletePatient, endVisit, generateRandomPatient, Patient, startVisit } from '../commands';
import { Visit } from '@openmrs/esm-framework';

let patient: Patient;
let visit: Visit;
const encounterNote = 'This is a test note';

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
  await createEncounter(api, patient.uuid, encounterNote);
});

test('should be able to see the active visits', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.clickOnActiveVisitPatient(patient.uuid);
  await expect(homePage.page.getByRole('heading')).toBe(visit.visitType);
  await homePage.clickOnVisitSummaryTab();
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
  await endVisit(api, patient.uuid);
});
