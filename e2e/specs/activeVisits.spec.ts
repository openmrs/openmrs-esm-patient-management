import { Encounter } from './../../packages/esm-active-visits-app/src/visits-summary/visit.resource';
import { test } from '../core';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';
import { createEncounter, deletePatient, endVisit, generateRandomPatient, Patient, startVisit } from '../commands';
import { Visit } from '@openmrs/esm-framework';

let patient: Patient;
let visit: Visit;
let encounter: Encounter;
const encounterNote = 'This is a test note';

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
  encounter = await createEncounter(api, patient.uuid, encounterNote);
});

test('should be able to see the active visits', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.clickOnActiveVisitPatient(patient.uuid);

  // Checks for the encounter
  await expect(
    page.getByTestId('encountersTable').getByRole('cell', { name: encounter.encounterType.display }),
  ).toBeTruthy();
  await expect(page.getByTestId('encountersTable').getByRole('cell', { name: 'Super User: Clinician' })).toBeTruthy();

  // Checks the visit details
  await expect(page.getByRole('cell', { name: patient.display })).toBeTruthy();
  await expect(
    page.getByTestId(`activeVisitRow${patient.uuid}`).getByRole('cell', { name: visit.display }),
  ).toBeTruthy();
});

test('should be able to see the active visit notes', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await homePage.clickOnActiveVisitPatient(patient.uuid);

  await homePage.clickOnVisitSummaryTab();
  await expect(page.getByRole('tabpanel', { name: encounterNote }).getByText('note')).toBeTruthy();
});

test.afterEach(async ({ api }) => {
  await deletePatient(api, patient.uuid);
  await endVisit(api, patient.uuid);
});
