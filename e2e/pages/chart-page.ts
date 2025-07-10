import { type Page } from '@playwright/test';

export class ChartPage {
  constructor(readonly page: Page) {}

  readonly formsTable = () => this.page.getByRole('table', { name: /forms/i });

  async goTo(patientUuid: string) {
    await this.page.goto('/openmrs/spa/patient/' + patientUuid + '/chart');
  }
}
