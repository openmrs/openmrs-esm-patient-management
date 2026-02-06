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

  await test.step('Given I navigate to the Appointments page in the patient chart', async () => {
    await appointmentsPage.goto(patient.uuid);
  });

  await test.step('And I click on the “Add” button', async () => {
    await page.getByRole('button', { name: 'Add', exact: true }).click();
  });

  await test.step('And I select "Outpatient Department" as the service', async () => {
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

  await test.step('And I set the appointment time to 10:00 AM', async () => {
    await page.locator('#time-picker').clear();
    await page.locator('#time-picker').fill('10:00');
    await page.locator('#time-picker-select-1').selectOption('AM');
  });

  await test.step('And I set the “Duration” to 60', async () => {
    await page.getByLabel('Duration (minutes)').fill('60');
  });

  await test.step('And I enter an appointment note', async () => {
    await page
      .getByPlaceholder(/write any additional points here/i)
      .fill('A sample note for testing out the appointment scheduling flow');
  });

  await test.step('And I click the "Save and close" button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message confirming the appointment was scheduled', async () => {
    await expect(page.getByText('Appointment scheduled', { exact: true })).toBeVisible();
  });

  await test.step('When I click the options menu on the newly created appointment row', async () => {
    await page.getByRole('button', { name: 'Options' }).click();
  });

  await test.step('And I select the "Edit" option from the menu', async () => {
    await page.getByRole('menuitem', { name: 'Edit' }).click();
  });

  await test.step('And I change the service to "General Medicine"', async () => {
    // Wait for the service select to be visible before interacting
    const serviceSelect = page.locator('select#service');
    await serviceSelect.waitFor({ state: 'visible' });
    await serviceSelect.selectOption({ label: 'General Medicine service' });
  });

  await test.step('And I change the appointment time to 2:00 PM', async () => {
    await page.locator('#time-picker').clear();
    await page.locator('#time-picker').fill('02:00');
    await page.locator('#time-picker-select-1').selectOption('PM');
  });

  await test.step('And I change the duration to 80 minutes', async () => {
    await page.getByLabel('Duration (minutes)').fill('80');
  });

  await test.step('And I update the appointment note', async () => {
    await page
      .getByPlaceholder('Write any additional points here')
      .fill('A sample note for testing out the edit flow for scheduled appointments');
  });

  await test.step('And I click the "Save and close" button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message confirming the appointment was edited', async () => {
    await expect(page.getByText('Appointment edited', { exact: true })).toBeVisible();
  });

  await test.step('When I navigate to the "Upcoming" appointments tab', async () => {
    await page.getByRole('tab', { name: /upcoming/i }).click();
  });

  await test.step('And I click the options menu on the edited appointment', async () => {
    const optionsButton = page.getByRole('button', { name: 'Options' });
    await expect(optionsButton).toBeVisible();
    await optionsButton.click();
  });

  await test.step('And I select the "Cancel" option from the menu', async () => {
    await page.getByRole('menuitem', { name: 'Cancel' }).click();
  });

  await test.step('And I confirm the cancellation by clicking the "Cancel appointment" button', async () => {
    await page.getByRole('button', { name: 'danger Cancel appointment' }).click();
  });

  await test.step('Then I should see a success message confirming the appointment was cancelled', async () => {
    await expect(page.getByText('Appointment cancelled successfully', { exact: true })).toBeVisible();
  });
});

test('Add and edit an appointment from appointments dashboard', async ({ page, patient }) => {
  const appointmentsPage = new AppointmentsPage(page);

  // Extract details from the created patient
  const openmrsIdentifier = getPatientIdentifierStr(patient);
  const firstName = patient.person.display.split(' ')[0];
  const lastName = patient.person.display.split(' ')[1];

  await test.step('Given I navigate to the Appointments dashboard', async () => {
    await appointmentsPage.goto();
  });

  await test.step('When I click the "Create new appointment" button', async () => {
    await page.getByRole('button', { name: 'Create new appointment', exact: true }).click();
  });

  await test.step('And I enter the patient identifier in the search field', async () => {
    await page.getByTestId('patientSearchBar').fill(openmrsIdentifier);
  });

  await test.step('Then I should see the patient matching the entered identifier in the search results', async () => {
    await expect(page.getByText(/1 search result/)).toBeVisible();
    await expect(page.getByText(new RegExp(firstName))).toBeVisible();
    await expect(page.getByText(new RegExp(lastName))).toBeVisible();
    await expect(page.getByText(new RegExp(openmrsIdentifier))).toBeVisible();
  });

  await test.step('When I click on the patient record from the search results', async () => {
    await page.getByText(new RegExp(firstName)).click();
  });

  await test.step('And I select “Outpatient Department” service', async () => {
    await page.selectOption('select#service', { label: 'Outpatient Department' });
  });

  await test.step('And I make appointment as “Scheduled”', async () => {
    await page.getByLabel('Select an appointment type').selectOption('Scheduled');
  });

  const now = dayjs();
  await test.step('And I set the appointment date to today', async () => {
    const dateInput = page.getByTestId('datePickerInput');
    const dateDayInput = dateInput.getByRole('spinbutton', { name: /day/i });
    const dateMonthInput = dateInput.getByRole('spinbutton', { name: /month/i });
    const dateYearInput = dateInput.getByRole('spinbutton', { name: /year/i });
    await dateDayInput.fill(now.format('DD'));
    await dateMonthInput.fill(now.format('MM'));
    await dateYearInput.fill(now.format('YYYY'));
  });

  await test.step('And I set the appointment time to the current time', async () => {
    await page.locator('#time-picker').clear();
    await page.locator('#time-picker').fill(now.format('hh:mm'));
    await page.locator('#time-picker-select-1').selectOption(now.format('A'));
  });

  await test.step('And I set the “Duration” to 60', async () => {
    await page.getByLabel('Duration (minutes)').fill('60');
  });

  await test.step('And I enter an appointment note', async () => {
    await page
      .getByPlaceholder(/write any additional points here/i)
      .fill('A sample note for testing out the appointment scheduling flow');
  });

  await test.step('And I click the "Save and close" button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message confirming the appointment was scheduled', async () => {
    await expect(page.getByText('Appointment scheduled', { exact: true })).toBeVisible();
  });

  await test.step('And the newly created appointment should appear in the appointments table', async () => {
    const appointmentRow = page.locator('table tr').filter({ hasText: openmrsIdentifier });
    await expect(appointmentRow).toBeVisible();
  });

  await test.step('When I click the options menu on the newly created appointment row', async () => {
    const appointmentRow = page.locator('table tr').filter({ hasText: openmrsIdentifier });
    await appointmentRow.getByRole('button', { name: 'Options' }).click();
  });

  await test.step('And I select the "Edit" option from the menu', async () => {
    await page.getByRole('menuitem', { name: 'Edit' }).click();
  });

  await test.step('And I change the service to "General Medicine"', async () => {
    const serviceSelect = page.locator('select#service');
    await serviceSelect.waitFor({ state: 'visible' });
    await serviceSelect.selectOption({ label: 'General Medicine service' });
  });

  await test.step('And I change the appointment time to 2:00 PM', async () => {
    await page.locator('#time-picker').clear();
    await page.locator('#time-picker').fill('02:00');
    await page.locator('#time-picker-select-1').selectOption('PM');
  });

  await test.step('And I change the duration to 80 minutes', async () => {
    await page.getByLabel('Duration (minutes)').fill('80');
  });

  await test.step('And I update the appointment note', async () => {
    await page
      .getByPlaceholder('Write any additional points here')
      .fill('A sample note for testing out the edit flow for scheduled appointments');
  });

  await test.step('And I click the "Save and close" button', async () => {
    await page.getByRole('button', { name: /save and close/i }).click();
  });

  await test.step('Then I should see a success message confirming the appointment was edited', async () => {
    await expect(page.getByText('Appointment edited', { exact: true })).toBeVisible();
  });

  await test.step('When I select the appointment from the appointments table', async () => {
    await page
      .getByRole('row', { name: firstName + ' ' + lastName })
      .locator('label')
      .click();
  });

  await test.step('And I click the "Change status" button', async () => {
    await page.getByRole('button', { name: 'Change status' }).click();
  });

  await test.step('Then the bulk status change modal should appear', async () => {
    await expect(page.getByRole('heading', { name: 'Change appointments status' })).toBeVisible();
  });
  await test.step('When I select "Completed" as the new status', async () => {
    await page.getByRole('combobox', { name: 'Select status' }).click();
    await page.getByRole('option', { name: 'Completed' }).locator('div').click();
  });

  await test.step('And I click the "Save and close" button in the modal', async () => {
    await page.getByRole('button', { name: 'Save and close' }).click();
  });

  await test.step('Then I should see a success message confirming the appointment status was changed', async () => {
    await expect(page.getByText('Appointments for selected patients have been successfully updated')).toBeVisible();
  });

  await test.step('Then the row should not be visible in the appointments table anymore', async () => {
    const appointmentRow = page.getByRole('row', { name: firstName + ' ' + lastName });
    await expect(appointmentRow).toHaveCount(0);
  });
});

test.afterEach(async ({ api }) => {
  if (visit) {
    await endVisit(api, visit.uuid);
    visit = undefined;
  }
});
