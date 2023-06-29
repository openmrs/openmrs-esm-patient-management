import { expect } from '@playwright/test';
import { Visit } from '@openmrs/esm-framework';
import { test } from '../core';
import type { Provider } from '../../packages/esm-appointments-app/src/types/index';
import type { Encounter } from '../../packages/esm-active-visits-app/src/visits-summary/visit.resource';
import {
  createEncounter,
  deleteEncounter,
  deletePatient,
  endVisit,
  generateRandomPatient,
  Patient,
  startVisit,
  getProvider,
} from '../commands';
import { HomePage } from '../pages';

let patient: Patient;
let visit: Visit;
let encounter: Encounter;
let provider: Provider;
const encounterNote = 'This is a test note';

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  visit = await startVisit(api, patient.uuid);
  provider = await getProvider(api);
  encounter = await createEncounter(api, patient.uuid, provider.uuid, encounterNote);
});

test('View active visits', async ({ page }) => {
  const homePage = new HomePage(page);
  const openmrsIdentifier = patient.identifiers[0].display.split('=')[1].trim();
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];

  await test.step('When I visit the home page', async () => {
    await homePage.goto();
  });

  await test.step("And I click on a patient's name in the active visits table", async () => {
    await homePage.clickOnActiveVisitPatient(patient.uuid);
  });

  await test.step('Then I should see data about the active visit such as the encounters recorded during their visit and their observations and a summary of the diagnoses, notes, and medications recorded', async () => {
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
});

test.afterEach(async ({ api }) => {
  await endVisit(api, patient.uuid);
  await deleteEncounter(api, encounter.uuid);
  await deletePatient(api, patient.uuid);
});
