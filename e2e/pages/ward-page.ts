import { type Page } from '@playwright/test';

export class WardPage {
  constructor(readonly page: Page) {}

  readonly manageAdmissionRequestsButton = () => this.page.getByRole('button', { name: 'Manage' });
  readonly cancelButton = () => this.page.getByRole('button', { name: 'Cancel' });
  readonly saveButton = () => this.page.getByRole('button', { name: 'Save' });
  readonly admissionNotesField = () => this.page.getByRole('textbox');
  readonly cancelAdmissionRequestHeading = () => this.page.getByText('Cancel admission request');
  readonly clinicalNotesHeading = () => this.page.getByRole('heading', { name: 'Clinical notes' });

  async goTo() {
    await this.page.goto(`/openmrs/spa/home/ward`);
  }

  async clickManageAdmissionRequests() {
    await this.manageAdmissionRequestsButton().click();
  }

  async clickCancelButton() {
    await this.cancelButton().click();
  }

  async fillAdmissionNotes(notes: string) {
    await this.admissionNotesField().fill(notes);
  }

  async clickSaveButton() {
    await this.saveButton().click();
  }

  async expectAdmissionRequestCancelled() {
    await this.page.getByText(/admission request cancelled/i).waitFor({ state: 'visible' });
  }
}
