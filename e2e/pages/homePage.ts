import { Page } from '@playwright/test';

export class HomePage {
  constructor(readonly page: Page) {}

  readonly patientSearchIcon = () => this.page.locator('[data-testid="searchPatientIcon"]');
  readonly patientSearchBar = () => this.page.locator('[data-testid="patientSearchBar"]');
  readonly floatingSearchResultsContainer = () => this.page.locator('[data-testid="floatingSearchResultsContainer"]');

  async goto() {
    await this.page.goto('home');
  }

  async searchPatient(searchText: string) {
    await this.patientSearchIcon().click();
    await this.patientSearchBar().type(searchText);
  }

  async clickOnPatientResult(name: string) {
    await this.floatingSearchResultsContainer().locator(`text=${name}`).click();
  }

  async clickOnActiveVisitPatient(patientId: string) {
    await this.page
      .locator(`[data-testid=activeVisitRow${patientId}]`)
      .getByRole('button', { name: 'Expand current row' })
      .click();
  }

  async clickOnVisitSummaryTab() {
    await this.page.getByRole('tab', { name: 'Visit Summary' }).click();
  }
}
