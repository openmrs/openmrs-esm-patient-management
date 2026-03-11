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
  readonly dischargeButton = () => this.page.getByRole('button', { name: 'Discharge' });
  readonly confirmDischargeButton = () => this.page.getByRole('button', { name: 'Proceed with patient discharge' });
  readonly transferSiderailIcon = () => this.page.getByRole('button', { name: /transfers/i });

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

  async clickTransferSiderailIcon() {
    await this.transferSiderailIcon().click();
  }

  async selectTransferLocation(locationName: string): Promise<boolean> {
    await Promise.race([
      this.page.getByRole('radio').first().waitFor({ state: 'visible', timeout: 10000 }),
      this.page.getByText(/no locations found/i).waitFor({ state: 'visible', timeout: 10000 }),
    ]);

    const targetLocation = this.page.getByRole('radio', { name: locationName });
    if (await targetLocation.isVisible()) {
      await this.page.locator('label.cds--radio-button__label', { hasText: locationName }).click();
      return true;
    } else {
      const firstLocation = this.page.getByRole('radio').first();
      if (await firstLocation.isVisible()) {
        await this.page.locator('label.cds--radio-button__label').first().click();
        return true;
      } else {
        return false;
      }
    }
  }

  async attemptTransferThePatient(locationName: string, note: string) {
    await Promise.race([
      this.page.getByRole('radio').first().waitFor({ state: 'visible', timeout: 10000 }),
      this.page.getByText(/no locations found/i).waitFor({ state: 'visible', timeout: 10000 }),
    ]);

    const targetLocation = this.page.getByRole('radio', { name: locationName });
    if (await targetLocation.isVisible()) {
      await this.page.locator('label.cds--radio-button__label', { hasText: locationName }).click();
      await this.page.getByRole('textbox', { name: 'Notes' }).fill(note);
      await this.saveButton().click();
      await this.page.getByText(/patient transfer request created/i).waitFor({ state: 'visible' });
    } else {
      const firstLocation = this.page.getByRole('radio').first();
      if (await firstLocation.isVisible()) {
        await this.page.locator('label.cds--radio-button__label').first().click();
        await this.page.getByRole('textbox', { name: 'Notes' }).fill(note);
        await this.saveButton().click();
        await this.page.getByText(/patient transfer request created/i).waitFor({ state: 'visible' });
      } else {
        await this.cancelButton().click();
      }
    }
  }

  async fillTransferNote(note: string) {
    await this.page.getByRole('textbox', { name: 'Notes' }).fill(note);
  }

  async expectTransferRequestCreated() {
    await this.page.getByText(/patient transfer request created/i).waitFor({ state: 'visible' });
  }

  async clickDischargeButton() {
    await this.dischargeButton().click();
  }

  async clickConfirmDischargeButton() {
    await this.confirmDischargeButton().click();
  }

  async expectDischargeSuccess() {
    await this.page.getByText(/patient was discharged/i).waitFor({ state: 'visible' });
  }
}
