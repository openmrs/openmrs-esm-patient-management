import { type Page } from '@playwright/test';

export class PatientChartPage {
  constructor(readonly page: Page) {}

  readonly formsTable = () => this.page.getByRole('table', { name: /forms/i });

  async goTo(patientUuid: string) {
    await this.page.goto(`${process.env.E2E_BASE_URL}/spa/patient/${patientUuid}/chart`);
  }
}
