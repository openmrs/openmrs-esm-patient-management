import { type Page } from '@playwright/test';

export type SexFilter = 'Any' | 'Male' | 'Female' | 'Other' | 'Unknown';

export class PatientSearchPage {
  constructor(readonly page: Page) {}

  readonly resultsCount = (count: number) => this.page.getByText(new RegExp(`^${count} search results?$`));
  readonly patientResultLink = (name: string) => this.page.getByRole('link', { name: new RegExp(name) });
  readonly noMatchingFiltersMessage = () => this.page.getByText(/no patients match these filters/i);
  readonly sexFilterTab = (sex: SexFilter) => this.page.getByRole('tab', { name: new RegExp(`^${sex}$`, 'i') });
  readonly yearOfBirthInput = () => this.page.getByRole('spinbutton', { name: /year of birth/i });
  readonly applyFiltersButton = () => this.page.getByRole('button', { name: /apply/i });
  readonly resetFiltersButton = () => this.page.getByRole('button', { name: /reset fields/i });

  async goto(query: string) {
    await this.page.goto(`search?query=${encodeURIComponent(query)}`);
  }
}
