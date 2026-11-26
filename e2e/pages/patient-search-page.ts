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

  /** Scope assertions to search results when a chart workspace is also open. */
  readonly results = () => this.page.locator('[data-openmrs-role="Search Results"]');
  readonly startVisitButton = () => this.results().getByRole('button', { name: /start visit/i });
  readonly noResultsMessage = () => this.page.getByText(/no patient charts were found/i);

  /** Header of the tablet overlay. The desktop page has no such header. */
  readonly overlayHeader = () => this.page.getByText('Search results', { exact: true });
  readonly overlayCloseButton = () =>
    this.page.getByRole('banner', { name: 'Close overlay' }).getByRole('button', { name: 'Close', exact: true });

  async goto(query: string) {
    await this.page.goto(`search?query=${encodeURIComponent(query)}`);
  }
}
