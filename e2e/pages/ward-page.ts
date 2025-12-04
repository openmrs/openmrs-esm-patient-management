import { type Page } from '@playwright/test';

export class WardPage {
  constructor(readonly page: Page) {}

  readonly manageAdmissionRequestsButton = () => this.page.getByRole('button', { name: 'Manage' });
  readonly cancelButton = () => this.page.getByRole('button', { name: 'Cancel' });
  readonly saveButton = () => this.page.getByRole('button', { name: 'Save' });
  readonly clinicalNotesField = () => this.page.getByRole('textbox', { name: /clinical notes/i });
  readonly wardAdmissionNoteField = () => this.page.getByRole('textbox', { name: /write your notes/i });
  readonly cancelAdmissionRequestHeading = () => this.page.getByText('Cancel admission request');
  readonly transferButton = () => this.page.getByRole('button', { name: 'Transfers' });
  readonly swapButton = () => this.page.getByRole('tab', { name: 'Bed swap' });

  async clickPatientCard(patientName: string) {
    // Wait for patient to be loaded - use first() to avoid strict mode violation
    await this.page
      .locator(`[class*="wardPatientCard"]:has-text("${patientName}")`)
      .first()
      .waitFor({ state: 'visible' });

    // Click the patient card directly
    await this.page.locator(`[class*="wardPatientCard"]:has-text("${patientName}")`).first().click({ force: true });
  }

  async goTo() {
    await this.page.goto('home/ward');
  }

  async clickManageAdmissionRequests() {
    await this.manageAdmissionRequestsButton().click();
  }

  async waitForAdmissionRequest(patientName: string) {
    // Wait for the admission request to appear in the list
    // Note: API polling in test setup ensures data is available, so shorter timeout is sufficient
    await this.page
      .locator('[class*="admissionRequestCard"]')
      .filter({ hasText: patientName })
      .first()
      .waitFor({ state: 'visible', timeout: 5000 });
  }

  async clickPatientNotesButton() {
    await this.page.getByRole('button', { name: 'Patient Note' }).click();
  }

  async clickCancelAdmissionButton(patientName: string) {
    await this.page
      .locator(`[class*="admissionRequestCard"]:has-text("${patientName}") button`)
      .filter({ hasText: 'Cancel' })
      .first()
      .click();
  }

  async fillWardAdmissionNote(note: string) {
    await this.wardAdmissionNoteField().fill(note);
  }

  async clickSaveButton() {
    await this.saveButton().click();
  }

  async expectAdmissionRequestCancelled() {
    await this.page.getByText(/admission request cancelled/i).waitFor({ state: 'visible' });
  }

  async waitForPatientInWardView(patientName: string) {
    await this.page
      .locator(`[class*="wardPatientCard"]:has-text("${patientName}")`)
      .first()
      .waitFor({ state: 'visible' });
  }

  async clickAdmitPatientButton(patientName: string) {
    await this.page
      .locator(`[class*="admissionRequestCard"]:has-text("${patientName}") button`)
      .filter({ hasText: 'Admit patient' })
      .first()
      .click();
  }

  async expectAdmissionSuccessNotification(patientName: string, bedNumber: string) {
    await this.page
      .getByText(new RegExp(`${patientName}\\s+has been successfully admitted and assigned to bed ${bedNumber}`, 'i'))
      .waitFor({ state: 'visible' });
  }
}
