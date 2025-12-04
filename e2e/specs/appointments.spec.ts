import dayjs from 'dayjs';
import { expect } from '@playwright/test';
import { type Visit } from '@openmrs/esm-framework';
import { startVisit, endVisit, getPatientIdentifierStr } from '../commands';
import { test } from '../core';
import { AppointmentsPage, PatientChartAppointmentsPage } from '../pages';

/**
 * Returns a business day (Mon-Fri) for scheduling appointments.
 * If the target date falls on a weekend, advances to the next Monday.
 * Note: Does not account for public holidays.
 *
 * @param daysFromToday - Number of days to add from today (0 = today)
 * @param hour - Hour to set (24-hour format)
 * @returns A dayjs object set to a business day with the specified hour
 */
const getBusinessDay = (daysFromToday: number, hour: number): dayjs.Dayjs => {
  let targetDate = dayjs().add(daysFromToday, 'day');

  // If the target date falls on a weekend, move to next Monday
  while (targetDate.day() === 0 || targetDate.day() === 6) {
    targetDate = targetDate.add(1, 'day');
  }

  return targetDate.hour(hour).minute(0).second(0).millisecond(0);
};

let visit: Visit;

test('Add, edit and cancel an appointment from patient chart', async ({ api, page, patient }) => {
  visit = await startVisit(api, patient.uuid);
  const appointmentsPage = new PatientChartAppointmentsPage(page);

  await test.step('When I go to the Appointments page in the patient chart', async () => {
    await appointmentsPage.goto(patient.uuid);
  });

  await test.step('And I click on the “Add” button', async () => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
  });

  await test.step('And I select "Outpatient Department" service', async () => {
    // Wait for the service select to be visible before interacting
    const serviceSelect = page.locator('select#service');
    await serviceSelect.waitFor({ state: 'visible' });
    await serviceSelect.selectOption({ label: 'Outpatient Department' });
  });

  await test.step('And I make appointment as “Scheduled”', async () => {
    await page.getByLabel('Select an appointment type').selectOption('Scheduled');
  });

  await test.step('And I set the appointment date to the next business day', async () => {
    const nextBusinessDay = getBusinessDay(1, 10);
    const dateInput = page.getByTestId('datePickerInput');
    const dateDayInput = dateInput.getByRole('spinbutton', { name: /day/i });
    const dateMonthInput = dateInput.getByRole('spinbutton', { name: /month/i });
    const dateYearInput = dateInput.getByRole('spinbutton', { name: /year/i });
    await dateDayInput.fill(nextBusinessDay.format('DD'));
    await dateMonthInput.fill(nextBusinessDay.format('MM'));
    await dateYearInput.fill(nextBusinessDay.format('YYYY'));
  });

  await test.step('And I set time to 10:00 AM', async () => {
    await page.locator('#time-picker').clear();
    await page.locator('#time-picker').fill('10:00');
    await page.locator('#time-picker-select-1').selectOption('AM');
  });

  await test.step('And I set the “Duration” to 60', async () => {
    await page.getByLabel('Duration (minutes)').fill('60');
  });

  await test.step('And I add a note', async () => {
    await page
      .getByPlaceholder(/write any additional points here/i)
      .fill('A sample note for testing out the appointment scheduling flow');
  });

  await test.step('And I click Save button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText('Appointment scheduled', { exact: true })).toBeVisible();
  });

  await test.step('When I click the overflow menu on the table row with the newly created appointment', async () => {
    await page.getByRole('button', { name: 'Options' }).click();
  });

  await test.step('And I choose the "Edit" option from the popup menu', async () => {
    await page.getByRole('menuitem', { name: 'Edit' }).click();
  });

  await test.step('When I change to "Inpatient ward" location', async () => {
    // Wait for the service select to be visible before interacting
    const serviceSelect = page.locator('select#service');
    await serviceSelect.waitFor({ state: 'visible' });
    await serviceSelect.selectOption({ label: 'General Medicine service' });
  });

  await test.step('And I change to "General Medicine" Service', async () => {
    await page.getByLabel('Select a service').selectOption('General Medicine service');
  });

  await test.step('And I change the time to 2:00 PM', async () => {
    await page.locator('#time-picker').clear();
    await page.locator('#time-picker').fill('02:00');
    await page.locator('#time-picker-select-1').selectOption('PM');
  });

  await test.step('And I set the "Duration" of the appointment"', async () => {
    await page.getByLabel('Duration (minutes)').fill('80');
  });

  await test.step('And I change the note', async () => {
    await page
      .getByPlaceholder('Write any additional points here')
      .fill('A sample note for testing out the edit flow for scheduled appointments');
  });

  await test.step('And I click Save button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText('Appointment edited', { exact: true })).toBeVisible();
  });

  await test.step('When I open the tab containing the edited appointment', async () => {
    await page.getByRole('tab', { name: /upcoming/i }).click();
  });

  await test.step('Then I click the options kebab menu in the appointment', async () => {
    const optionsButton = page.getByRole('button', { name: 'Options' });
    await expect(optionsButton).toBeVisible();
    await optionsButton.click();
  });

  await test.step('And I choose the "Cancel" option', async () => {
    await page.getByRole('menuitem', { name: 'Cancel' }).click();
  });

  await test.step('When I click the "Cancel appointment" button to confirm', async () => {
    await page.getByRole('button', { name: 'danger Cancel appointment' }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText('Appointment cancelled successfully', { exact: true })).toBeVisible();
  });
});

test('Add and edit an appointment from appointments app', async ({ page, patient }) => {
  const appointmentsPage = new AppointmentsPage(page);

  // extract details from the created patient
  const openmrsIdentifier = getPatientIdentifierStr(patient);
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];

  await test.step('When I go to the Appointments app', async () => {
    await appointmentsPage.goto();
  });

  await test.step('And I click on the "Create new appointment" button', async () => {
    await page.getByRole('button', { name: 'Create new appointment', exact: true }).click();
  });

  await test.step('And I enter a valid patient identifier into the search field', async () => {
    await page.getByTestId('patientSearchBar').fill(openmrsIdentifier);
  });

  await test.step('Then I should see only the patient with the entered identifier', async () => {
    await expect(page.getByText(/1 search result/)).toBeVisible();
    await expect(page.getByText(new RegExp(firstName))).toBeVisible();
    await expect(page.getByText(new RegExp(lastName))).toBeVisible();
    await expect(page.getByText(new RegExp(openmrsIdentifier))).toBeVisible();
  });

  await test.step('When I click on the patient record', async () => {
    await page.getByText(new RegExp(firstName)).click();
  });

  await test.step('And I select “Outpatient Department” service', async () => {
    await page.selectOption('select#service', { label: 'Outpatient Department' });
  });

  await test.step('And I make appointment as “Scheduled”', async () => {
    await page.getByLabel('Select an appointment type').selectOption('Scheduled');
  });

  const now = dayjs();
  await test.step('And I set the appointment date to today day', async () => {
    const dateInput = page.getByTestId('datePickerInput');
    const dateDayInput = dateInput.getByRole('spinbutton', { name: /day/i });
    const dateMonthInput = dateInput.getByRole('spinbutton', { name: /month/i });
    const dateYearInput = dateInput.getByRole('spinbutton', { name: /year/i });
    await dateDayInput.fill(now.format('DD'));
    await dateMonthInput.fill(now.format('MM'));
    await dateYearInput.fill(now.format('YYYY'));
  });

  await test.step('And I set time', async () => {
    await page.locator('#time-picker').clear();
    await page.locator('#time-picker').fill(now.format('hh:mm'));
    await page.locator('#time-picker-select-1').selectOption(now.format('A'));
  });

  await test.step('And I set the “Duration” to 60', async () => {
    await page.getByLabel('Duration (minutes)').fill('60');
  });

  await test.step('And I add a note', async () => {
    await page
      .getByPlaceholder(/write any additional points here/i)
      .fill('A sample note for testing out the appointment scheduling flow');
  });

  await test.step('And I click Save button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText('Appointment scheduled', { exact: true })).toBeVisible();
  });

  await test.step('And a new row is added to the appointments table', async () => {
    const appointmentRow = page.locator('table tr').filter({ hasText: openmrsIdentifier });
    await expect(appointmentRow).toBeVisible();
  });

  await test.step('When I click the overflow menu on the table row with the newly created appointment', async () => {
    const appointmentRow = page.locator('table tr').filter({ hasText: openmrsIdentifier });
    await appointmentRow.getByRole('button', { name: 'Options' }).click();
  });

  await test.step('And I choose the "Edit" option from the popup menu', async () => {
    await page.getByRole('menuitem', { name: 'Edit' }).click();
  });

  await test.step('When I change to “Inpatient ward” location', async () => {
    await page.selectOption('select#service', { label: 'General Medicine service' });
  });

  await test.step('And I change to "General Medicine" Service', async () => {
    await page.getByLabel('Select a service').selectOption('General Medicine service');
  });

  await test.step('And I change the time to 2:00 PM', async () => {
    await page.locator('#time-picker').clear();
    await page.locator('#time-picker').fill('02:00');
    await page.locator('#time-picker-select-1').selectOption('PM');
  });

  await test.step('And I set the "Duration" of the appointment"', async () => {
    await page.getByLabel('Duration (minutes)').fill('80');
  });

  await test.step('And I change the note', async () => {
    await page
      .getByPlaceholder('Write any additional points here')
      .fill('A sample note for testing out the edit flow for scheduled appointments');
  });

  await test.step('And I click Save button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message', async () => {
    await expect(page.getByText('Appointment edited', { exact: true })).toBeVisible();
  });
});

test.afterEach(async ({ api }) => {
  if (visit) {
    await endVisit(api, visit.uuid);
    visit = undefined;
  }
});
