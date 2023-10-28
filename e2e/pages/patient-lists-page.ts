import { Page } from '@playwright/test';

export class PatientListsPage {
  constructor(readonly page: Page) {}

  readonly allListsButton = () => this.page.getByRole('tab', { name: 'All lists' });
  readonly patientListsTable = () => this.page.getByTestId('patientListsTable');
  readonly patientListHeader = () => this.page.getByTestId('patientListHeader');
  readonly patientsTable = () => this.page.getByTestId('patientsTable');

  async goto(patientListUuid?: string) {
    await this.page.goto(`home/patient-lists/${patientListUuid ?? ''}`);
  }

  async addNewPatientList(listName: string, description: string) {
    await this.page.getByRole('button', { name: 'New List' }).click();
    await this.page.getByLabel('List name').fill(listName);
    await this.page.getByLabel('Describe the purpose of this list in a few words').fill(description);
    await this.page.getByRole('button', { name: 'Create list' }).click();
  }

  async editPatientList(listName: string, description: string) {
    await this.page.getByRole('button', { name: 'Actions' }).click();
    await this.page.getByRole('menuitem', { name: 'Edit name or description' }).click();
    await this.page.getByLabel('List name').fill(listName);
    await this.page.getByLabel('Describe the purpose of this list in a few words').fill(description);
    await this.page.getByRole('button', { name: 'Edit list' }).click();
  }

  async searchPatientList(listName: string) {
    await this.page.getByRole('searchbox').fill(listName);
  }

  async deletePatientList() {
    await this.page.getByRole('button', { name: 'Actions' }).click();
    await this.page.getByRole('menuitem', { name: 'Delete patient list' }).click();
  }
}
