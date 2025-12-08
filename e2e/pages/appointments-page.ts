import { type Page } from '@playwright/test';

export class AppointmentsPage {
  constructor(readonly page: Page) {}

  readonly appointmentsTable = () => this.page.getByTestId('table');

  async goto(uuid: string) {
    await this.page.goto(`${process.env.E2E_BASE_URL}/spa/patient/${uuid}/chart/Appointments`);
  }
}
