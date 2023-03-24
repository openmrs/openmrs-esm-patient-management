import { test } from '../core';
import { PatientListsPage } from '../pages';
import { expect } from '@playwright/test';
import {
  addPatientToCohort,
  Cohort,
  CohortMember,
  CohortType,
  deleteCohort,
  deleteCohortType,
  deletePatient,
  generateRandomCohort,
  generateRandomCohortType,
  generateRandomPatient,
  Patient,
  removePatientFromCohort,
} from '../commands';

let patient: Patient;
let cohortType: CohortType;
let cohort: Cohort;
let createdCohortUuid: string;
let createdCohortMember: CohortMember;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  cohortType = await generateRandomCohortType(api);
  cohort = await generateRandomCohort(api, cohortType.uuid);
});

test('should be able to create and edit a patient list', async ({ page }) => {
  const patientListPage = new PatientListsPage(page);
  await patientListPage.goto();

  // Create a new patient list
  const patientListName = `Cohort ${Math.floor(Math.random() * 10000)}`;
  const patientListDescription = `Cohort Description ${Math.floor(Math.random() * 10000)}`;
  await patientListPage.addNewPatientList(patientListName, patientListDescription, cohortType.name);

  await patientListPage.allListsButton().click();
  await patientListPage.searchPatientList(patientListName);
  await patientListPage.patientListsTable().getByText(patientListName).click();

  await expect(page).toHaveURL(new RegExp('^[\\w\\d:\\/.-]+\\/patient-list\\/[\\w\\d-]+$'));
  createdCohortUuid = /patient-list\/([\w\d-]+)/.exec(page.url())?.[1] ?? null;

  await expect(patientListPage.patientListHeader()).toHaveText(new RegExp(patientListName));
  await expect(patientListPage.patientListHeader()).toHaveText(new RegExp(patientListDescription));
  await expect(patientListPage.patientListHeader()).toHaveText(/0 patients/);

  // Edit the patient list
  const editedPatientListName = patientListName + ' edited';
  const editedPatientListDescription = patientListDescription + ' edited';
  await patientListPage.editPatientList(editedPatientListName, editedPatientListDescription);

  await expect(patientListPage.patientListHeader()).toHaveText(new RegExp(editedPatientListName));
  await expect(patientListPage.patientListHeader()).toHaveText(new RegExp(editedPatientListDescription));
});

test('should be able to delete a patient list', async ({ page }) => {
  const patientListPage = new PatientListsPage(page);
  await patientListPage.goto(cohort.uuid);

  await patientListPage.deletePatientList();

  await patientListPage.allListsButton().click();
  await patientListPage.searchPatientList(cohort.name);
  await expect(patientListPage.patientListsTable()).toHaveText(new RegExp(cohort.name));
});

test('should be able to manage patients in a patient list', async ({ page, api }) => {
  const patientListPage = new PatientListsPage(page);

  // Add a patient to the patient list
  createdCohortMember = await addPatientToCohort(api, cohort.uuid, patient.uuid);
  await patientListPage.goto(cohort.uuid);
  await expect(patientListPage.patientListHeader()).toHaveText(/1 patients/);
  await expect(patientListPage.patientsTable()).toHaveText(new RegExp(patient.person.display));

  // Remove a patient from the patient list
  await removePatientFromCohort(api, createdCohortMember.uuid);
  await patientListPage.goto(cohort.uuid);
  await expect(patientListPage.patientListHeader()).toHaveText(/0 patients/);
  await expect(patientListPage.patientsTable()).not.toHaveText(new RegExp(patient.person.display));
  createdCohortMember = null;
});

test.afterEach(async ({ api }) => {
  if (createdCohortMember) {
    await removePatientFromCohort(api, createdCohortMember.uuid);
  }
  if (createdCohortUuid) {
    await deleteCohort(api, createdCohortUuid);
  }
  await deletePatient(api, patient.uuid);
  await deleteCohort(api, cohort.uuid);
  await deleteCohortType(api, cohortType.uuid);
});
