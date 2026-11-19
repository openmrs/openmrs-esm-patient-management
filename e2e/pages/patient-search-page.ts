import { expect, type Page } from '@playwright/test';

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

  /** The search results, as opposed to anything else on the page (the start visit form has its own button). */
  readonly results = () => this.page.locator('[data-openmrs-role="Search Results"]');
  readonly startVisitButton = () => this.results().getByRole('button', { name: /start visit/i });
  readonly noResultsMessage = () => this.page.getByText(/no patient charts were found/i);

  /** Header of the tablet overlay. The desktop page has no such header. */
  readonly overlayHeader = () => this.page.getByText('Search results', { exact: true });
  readonly overlayCloseButton = () => this.page.getByRole('button', { name: 'Close', exact: true });

  /** The visit form that opens in the workspace when starting a visit. */
  readonly visitForm = () => this.page.locator('form').filter({ has: this.page.getByRole('radio') });
  readonly visitFormStartButton = () => this.visitForm().getByRole('button', { name: /start visit/i });

  /** Fills in the visit form that the start visit button opened, and submits it. */
  async startVisitInVisitForm(visitType = 'OPD Visit') {
    // The location defaults asynchronously, and submitting before it resolves fails validation.
    await expect
      .poll(async () => (await this.page.getByRole('combobox', { name: /select a location/i }).inputValue()).trim(), {
        message: 'Waiting for the visit location to resolve',
      })
      .not.toBe('');
    await this.visitForm()
      .locator('label')
      .filter({ hasText: new RegExp(`^${visitType}$`, 'i') })
      .click();
    await this.visitFormStartButton().click();
  }

  async goto(query: string) {
    await this.page.goto(`search?query=${encodeURIComponent(query)}`);
  }
}
