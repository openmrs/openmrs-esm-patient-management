import { test } from '../core';
import { PatientListsPage } from '../pages';
import { expect } from '@playwright/test';
import {
  generateRandomPatient,
  deletePatient,
  Patient,
  generateRandomCohortType,
  Cohort,
  CohortType,
  deleteCohortType,
  deleteCohort,
  generateRandomCohort,
  addPatientToCohort,
  CohortMember,
  removePatientFromCohort,
} from '../commands';

let patient: Patient;
let cohortType: CohortType;
let cohort: Cohort;
let createdCohortMember: CohortMember;
let createdPatientListUuid: string;

test.beforeEach(async ({ api }) => {
  patient = await generateRandomPatient(api);
  cohortType = await generateRandomCohortType(api);
  cohort = await generateRandomCohort(api, cohortType.uuid);
});

test('should be able to create and display a patient list', async ({ page }) => {
  const patientListName = `Cohort ${Math.floor(Math.random() * 10000)}`;
  const patientListDescription = `Cohort Description ${Math.floor(Math.random() * 10000)}`;

  const patientListPage = new PatientListsPage(page);
  await patientListPage.goto();

  await patientListPage.addNewPatientList(patientListName, patientListDescription, cohortType.name);

  await patientListPage.patientListsTable().getByText(patientListName).click();
  await expect(page).toHaveURL(new RegExp('^[\\w\\d:\\/.-]+\\/patient-list\\/[\\w\\d-]+$'));
  createdPatientListUuid = /patient-list\/([\w\d-]+)/.exec(page.url())?.[1] ?? null;

  await expect(patientListPage.patientListHeader()).toHaveText(new RegExp(patientListName));
  await expect(patientListPage.patientListHeader()).toHaveText(new RegExp(patientListDescription));
  await expect(patientListPage.patientListHeader()).toHaveText(/0 patients/);
});

test('should be able to edit the details of a patient list', async ({ page }) => {
  const patientListPage = new PatientListsPage(page);
  await patientListPage.goto(cohort.uuid);

  const editedPatientListName = cohort.name + ' edited';
  const editedPatientListDescription = cohort.description + ' edited';

  await patientListPage.editPatientList(editedPatientListName, editedPatientListDescription, cohortType.name);

  await expect(patientListPage.patientListHeader()).toHaveText(new RegExp(editedPatientListName));
  await expect(patientListPage.patientListHeader()).toHaveText(new RegExp(editedPatientListDescription));
});

test('should be able to display the patients of a patient list', async ({ page, api }) => {
  createdCohortMember = await addPatientToCohort(api, cohort.uuid, patient.uuid);

  const patientListPage = new PatientListsPage(page);
  await patientListPage.goto(cohort.uuid);

  await expect(patientListPage.patientListHeader()).toHaveText(/1 patients/);
  await expect(patientListPage.patientsTable()).toHaveText(new RegExp(patient.person.display));
});

// TODO: Uncomment this when the delete patient list functionality is fixed
// test('should be able to delete a patient list', async ({ page }) => {
//   const patientListPage = new PatientListsPage(page);
//   await patientListPage.goto(cohort.uuid);

//   await patientListPage.deletePatientList();

//   await expect(patientListPage.patientListsTable()).not.toHaveText(new RegExp(cohort.name));
// });

test.afterEach(async ({ api }) => {
  if (createdCohortMember) {
    await removePatientFromCohort(api, createdCohortMember.uuid);
  }
  if (createdPatientListUuid) {
    await deleteCohort(api, createdPatientListUuid);
  }
  await deletePatient(api, patient.uuid);
  await deleteCohort(api, cohort.uuid);
  await deleteCohortType(api, cohortType.uuid);
});
