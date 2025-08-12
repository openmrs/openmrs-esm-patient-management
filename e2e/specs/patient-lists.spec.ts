import { test } from '../core';
import { PatientListsPage } from '../pages';
import { expect } from '@playwright/test';
import { addPatientToCohort, deleteCohort, generateRandomCohort, removePatientFromCohort } from '../commands';
import { type Cohort, type CohortMember } from '../commands/types';

let cohortMember: CohortMember;
let cohortUuid: string;
let cohort: Cohort;

test.beforeEach(async ({ api }) => {
  cohort = await generateRandomCohort(api);
});

test('Create and edit a patient list', async ({ page }) => {
  const patientListPage = new PatientListsPage(page);

  await test.step('When I visit the patient lists page', async () => {
    await patientListPage.goto();
  });

  // Create a new patient list
  const suffix = `${test.info().project.name}-${test.info().workerIndex}-${Date.now().toString(36)}`;
  const patientListName = `Patient list — ${suffix}`;
  const patientListDescription = `Automated test (run ${suffix})`;

  await test.step('When I create a new list', async () => {
    await patientListPage.addNewPatientList(patientListName, patientListDescription);
  });

  await test.step("And I navigate to the new list's page", async () => {
    await patientListPage.allListsButton().click();
    await patientListPage.searchPatientList(patientListName);
    await expect(patientListPage.patientListsTable().getByText(patientListName)).toBeVisible();
    await patientListPage.patientListsTable().getByText(patientListName).click();
  });

  await test.step('Then I should see the information about the list', async () => {
    await expect(page).toHaveURL(new RegExp('^[\\w\\d:\\/.-]+\\/patient-lists\\/[\\w\\d-]+$'));
    const [, extractedUuid] = /patient-lists\/([\w\d-]+)/.exec(page.url());
    cohortUuid = extractedUuid;

    await expect(patientListPage.patientListHeader()).toContainText(patientListName);
    await expect(patientListPage.patientListHeader()).toContainText(patientListDescription);
    await expect(patientListPage.patientListHeader()).toHaveText(/0 patients/);
  });

  // Edit the patient list
  const editedPatientListName = patientListName + ' edited';
  const editedPatientListDescription = patientListDescription + ' edited';

  await test.step("When I edit the list's details", async () => {
    await patientListPage.editPatientList(editedPatientListName, editedPatientListDescription);
  });

  await test.step('Then I should see the updated information about the list', async () => {
    await expect(patientListPage.patientListHeader()).toContainText(editedPatientListName);
    await expect(patientListPage.patientListHeader()).toContainText(editedPatientListDescription);
  });
});

test('Manage patients in a list', async ({ api, page, patient }) => {
  const patientListPage = new PatientListsPage(page);

  await test.step("When I visit a specific patient list's page", async () => {
    await patientListPage.goto(cohort.uuid);
  });

  await test.step('Then I should be able to add and remove patients from that list', async () => {
    // Add a patient to the list
    cohortMember = await addPatientToCohort(api, cohort.uuid, patient.uuid);
    await patientListPage.goto(cohort.uuid);
    await expect(patientListPage.patientListHeader()).toHaveText(/1 patients/);
    await expect(patientListPage.patientsTable()).toHaveText(new RegExp(patient.person.display));

    // Remove a patient from the list
    await removePatientFromCohort(api, cohortMember.uuid);
    await patientListPage.goto(cohort.uuid);
    await expect(patientListPage.patientListHeader()).toHaveText(/0 patients/);
    cohortMember = null;
  });
});

test.afterEach(async ({ api }) => {
  if (cohortMember) {
    await removePatientFromCohort(api, cohortMember.uuid);
  }
  await deleteCohort(api, cohortUuid);
  await deleteCohort(api, cohort.uuid);
});
