import { type Page } from '@playwright/test';

export class WardPage {
  constructor(readonly page: Page) {}

  readonly manageAdmissionRequestsButton = () => this.page.getByRole('button', { name: 'Manage' });
  readonly cancelButton = () => this.page.getByRole('button', { name: 'Cancel' });
  readonly saveButton = () => this.page.getByRole('button', { name: 'Save' });
  readonly clinicalNotesField = () => this.page.getByRole('textbox', { name: /clinical notes/i });
  readonly wardAdmissionNoteField = () => this.page.getByRole('textbox', { name: /write your notes/i });
  readonly cancelAdmissionRequestHeading = () => this.page.getByText('Cancel admission request');

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

  async clickPatientNotesButton() {
    await this.page.getByRole('button', { name: 'Patient Note' }).click();
  }

  async clickCancelButton() {
    await this.cancelButton().click();
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

  async clickAdmitButton() {
    await this.page.getByRole('button', { name: /Admit/i }).click();
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
