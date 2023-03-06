import { Encounter } from './../../packages/esm-active-visits-app/src/visits-summary/visit.resource';
import { test } from '../core';
import { HomePage } from '../pages';
import { expect } from '@playwright/test';
import {
  createEncounter,
  deleteEncounter,
  deletePatient,
  endVisit,
  generateRandomPatient,
  Patient,
  startVisit,
} from '../commands';
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
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];

  await homePage.goto();

  await homePage.clickOnActiveVisitPatient(patient.uuid);

  // Checks the visit details
  await expect(page.getByTestId(`${visit.uuid}:idNumber`)).toContainText(openmrsIdentifier);
  await expect(page.getByTestId(`${visit.uuid}:name`)).toContainText(`${firstName} ${lastName}`);
  await expect(page.getByTestId(`${visit.uuid}:visitType`)).toContainText(visit.visitType.display);

  // Checks for the encounter
  await expect(page.getByTestId(`${encounter.uuid}:encounterType`)).toContainText(encounter.encounterType.display);
  await expect(page.getByTestId(`${encounter.uuid}:provider`)).toContainText('Super User: Clinician');

  // Checks for the visit note
  await homePage.clickOnVisitSummaryTab();
  await expect(page.getByTestId('note')).toContainText(encounterNote);
});

test.afterEach(async ({ api }) => {
  await endVisit(api, patient.uuid);
  await deleteEncounter(api, encounter.uuid);
  await deletePatient(api, patient.uuid);
});
