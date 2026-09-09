/**
 * @vitest-environment jsdom
 *
 * The form-submit flow under test does not fire its callback under happy-dom
 * (likely a DOM-event-dispatch divergence). Run this file under jsdom.
 */
import React from 'react';
import { vi, describe, it, expect, test, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import { type PatientSearchResponse } from '../types';
import { mockAdvancedSearchResults } from '__mocks__';
import { PatientSearchContext } from '../patient-search-context';
import { useInfinitePatientSearch } from '../patient-search.resource';
import {
  useAttributeConceptAnswers,
  useConfiguredAnswerConcepts,
  useLocations,
  usePersonAttributeType,
} from './refine-search/person-attributes.resource';
import AdvancedPatientSearchComponent from './advanced-patient-search.component';

const mockUseConfig = vi.mocked(useConfig<PatientSearchConfig>);
const mockUseInfinitePatientSearch = vi.mocked(useInfinitePatientSearch);
const mockUsePersonAttributeType = vi.mocked(usePersonAttributeType);

vi.mock('../patient-search.resource', () => ({
  useInfinitePatientSearch: vi.fn(),
}));

vi.mock('./refine-search/person-attributes.resource', () => ({
  useAttributeConceptAnswers: vi.fn(),
  useConfiguredAnswerConcepts: vi.fn(),
  useLocations: vi.fn(),
  usePersonAttributeType: vi.fn(),
}));

vi.mock('react-router-dom', async () => ({
  ...((await vi.importActual('react-router-dom')) as object),
  useParams: vi.fn(() => ({
    page: 1,
  })),
  useLocation: vi.fn(),
  useSearchParams: vi.fn(() => [
    {
      get: vi.fn(() => 'Jos'),
    },
  ]),
}));

const mockPatientActionContextValue = {
  nonNavigationSelectPatientAction: vi.fn(),
  selectPatientAction: vi.fn(),
};

const mockSearchResults: PatientSearchResponse = {
  isValidating: false,
  totalResults: 2,
  data: mockAdvancedSearchResults as unknown as PatientSearchResponse['data'],
  currentPage: 1,
  setPage: vi.fn(),
  hasMore: false,
  isLoading: false,
  fetchError: null,
};

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PatientSearchContext.Provider value={mockPatientActionContextValue}>{children}</PatientSearchContext.Provider>
);

describe('AdvancedPatientSearchComponent', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockUseInfinitePatientSearch.mockReturnValue(mockSearchResults);
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      search: {
        disableTabletSearchOnKeyUp: false,
        showRecentlySearchedPatients: false,
        searchFilterFields: {
          gender: {
            enabled: true,
          },
          dateOfBirth: {
            enabled: true,
          },
          age: {
            enabled: true,
            min: 0,
          },
          postcode: {
            enabled: true,
          },
          personAttributes: [
            {
              attributeTypeUuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
            },
          ],
        },
      } as PatientSearchConfig['search'],
    });
    mockUsePersonAttributeType.mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        format: 'java.lang.String',
        uuid: '14d4f066-15f5-102d-96e4-000c29c2a5d7',
        display: 'Telephone Number',
      },
    });
  });

  const renderComponent = (props = {}) => {
    return render(
      <Wrapper>
        <AdvancedPatientSearchComponent query="Jos" {...props} />
      </Wrapper>,
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Refine search')).toBeInTheDocument();
  });

  it('displays search results correctly', () => {
    renderComponent();
    expect(screen.getByText(/2 search result/)).toBeInTheDocument();
  });

  describe('Filtering', () => {
    it('filters by gender correctly', async () => {
      renderComponent();

      await user.click(screen.getByRole('tab', { name: /female/i }));
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(screen.getByText(/0 search result/)).toBeInTheDocument();
    });

    it('filters by age correctly', async () => {
      renderComponent();

      // Set age filter
      const ageInput = screen.getByRole('spinbutton', { name: /age/i });
      await user.type(ageInput, '30');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // TODO: Restore these tests once we improve the patient banner test stubs
      // expect one patient Joseph Davis
      // const patientBanners = screen.getAllByRole('banner');
      // expect(patientBanners).toHaveLength(1);
      // expect(within(patientBanners[0]).getByText(/Joseph Davis/i)).toBeInTheDocument();
      // expect(within(patientBanners[0]).getByText(/30/)).toBeInTheDocument();
    });

    it('filters by postcode correctly', async () => {
      renderComponent();

      // Set postcode filter
      const postcodeInput = screen.getByRole('textbox', { name: /postcode/i });
      await user.type(postcodeInput, '46548');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // TODO: Restore these tests once we improve the patient banner test stubs
      // // expect one patient Joseph Davis
      // const patientBanners = screen.getAllByRole('banner');
      // expect(patientBanners).toHaveLength(1);
      // expect(within(patientBanners[0]).getByText(/Joseph Davis/i)).toBeInTheDocument();
    });

    it('does not match a patient without a birthdate to a date of birth filter', async () => {
      const [patient] = mockAdvancedSearchResults;
      mockUseInfinitePatientSearch.mockReturnValue({
        ...mockSearchResults,
        data: [
          { ...patient, person: { ...patient.person, birthdate: null, age: null } },
        ] as unknown as PatientSearchResponse['data'],
      });
      renderComponent();

      await user.type(screen.getByRole('spinbutton', { name: /day of birth/i }), '1');
      await user.type(screen.getByRole('spinbutton', { name: /month of birth/i }), '1');
      await user.type(screen.getByRole('spinbutton', { name: /year of birth/i }), '1970');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(screen.getByText(/0 search result/)).toBeInTheDocument();
    });

    it('matches the date of birth as stored, whatever timezone the backend serialised it in', async () => {
      // Tests run in UTC, where `new Date` would read this birthdate as 31 December 1939.
      const [patient] = mockAdvancedSearchResults;
      mockUseInfinitePatientSearch.mockReturnValue({
        ...mockSearchResults,
        data: [
          { ...patient, person: { ...patient.person, birthdate: '1940-01-01T00:00:00.000+0300' } },
        ] as unknown as PatientSearchResponse['data'],
      });
      renderComponent();

      await user.type(screen.getByRole('spinbutton', { name: /day of birth/i }), '1');
      await user.type(screen.getByRole('spinbutton', { name: /month of birth/i }), '1');
      await user.type(screen.getByRole('spinbutton', { name: /year of birth/i }), '1940');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(screen.getByText(/1 search result/)).toBeInTheDocument();
    });

    it('ignores surrounding whitespace in the postcode filter', async () => {
      renderComponent();

      await user.type(screen.getByRole('textbox', { name: /postcode/i }), ' 20839 ');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      expect(screen.getByText(/1 search result/)).toBeInTheDocument();
    });

    it('filters by person attribute correctly', async () => {
      renderComponent();

      // Set phone number attribute filter
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '0785434125');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // TODO: Restore these tests once we improve the patient banner test stubs
      // const patientBanners = screen.getAllByRole('banner');
      // expect(patientBanners).toHaveLength(1);

      // expect(within(patientBanners[0]).getByText(/Joshua Johnson/)).toBeInTheDocument();
    });

    it('combines multiple filters correctly', async () => {
      renderComponent();

      // Set multiple filters
      await user.click(screen.getByRole('tab', { name: /any/i }));
      const ageInput = screen.getByRole('spinbutton', { name: /age/i });
      await user.type(ageInput, '5');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // TODO: Restore these tests once we improve the patient banner test stubs
      // // expect one patient Joshua Johnson
      // const patientBanners = screen.getAllByRole('banner');
      // expect(patientBanners).toHaveLength(1);
      // expect(within(patientBanners[0]).getByText(/Joshua Johnson/)).toBeInTheDocument();
    });

    it('resets filters correctly', async () => {
      renderComponent();

      // Set a filter
      await user.click(screen.getByRole('tab', { name: /female/i }));
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // Reset filters
      await user.click(screen.getByRole('button', { name: /reset fields/i }));

      // TODO: Restore these tests once we improve the patient banner test stubs
      // // expects all search results 2 patients
      // const patientBanners = screen.getAllByRole('banner');
      // expect(patientBanners).toHaveLength(2);
    });
  });

  describe('Layout', () => {
    it('renders in desktop layout by default', () => {
      renderComponent();
      const container = screen.getByText(/Refine search/i);
      expect(container).toBeInTheDocument();
    });

    it('renders in tablet layout when specified', () => {
      renderComponent({ inTabletOrOverlay: true });
      const container = screen.getByText(/Refine search/i);
      expect(container).toBeInTheDocument();
    });
  });

  describe.each(['org.openmrs.Concept', 'org.openmrs.Location'])('Clearing %s attributes', (format) => {
    const attributeTypeUuid = '8d87236c-c2cc-11de-8d13-0010c6dffd0f';
    const answer = { uuid: '1ce1b7d4-c865-4178-82b0-5932e51503d6', display: 'Community Outreach' };

    beforeEach(() => {
      const config: PatientSearchConfig = getDefaultsFromConfigSchema(configSchema);
      config.search.searchFilterFields.personAttributes = [{ attributeTypeUuid }];
      mockUseConfig.mockReturnValue(config);
      mockUsePersonAttributeType.mockReturnValue({
        data: { uuid: attributeTypeUuid, display: 'Health Center', format },
        isLoading: false,
        error: null,
      });
      vi.mocked(useConfiguredAnswerConcepts).mockReturnValue({
        configuredConceptAnswers: [],
        isLoadingConfiguredAnswers: false,
      });
      vi.mocked(useAttributeConceptAnswers).mockReturnValue({
        conceptAnswers: [answer],
        isLoadingConceptAnswers: false,
        errorFetchingConceptAnswers: null,
      });
      vi.mocked(useLocations).mockReturnValue({
        locations: [
          { resource: { id: answer.uuid, name: answer.display, resourceType: 'Location', status: 'active' } },
        ],
        isLoading: false,
        loadingNewData: false,
        error: null,
      });
    });

    it('restores results when an applied attribute selection is cleared', async () => {
      renderComponent();

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText(answer.display));
      await user.click(screen.getByRole('button', { name: /^apply/i }));
      expect(screen.getByRole('heading', { name: '1 search result' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /clear selected item/i }));
      await user.click(screen.getByRole('button', { name: /^apply/i }));

      expect(screen.getByRole('heading', { name: '2 search result' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Apply', exact: true })).toBeInTheDocument();
    });

    it('keeps patients without the attribute when a cleared selection is applied', async () => {
      mockUseInfinitePatientSearch.mockReturnValue({
        ...mockSearchResults,
        data: mockSearchResults.data.map((patient) => ({ ...patient, attributes: [] })),
      });
      renderComponent();

      await user.click(screen.getByRole('combobox'));
      await user.click(screen.getByText(answer.display));
      await user.click(screen.getByRole('button', { name: /clear selected item/i }));
      await user.click(screen.getByRole('button', { name: /^apply/i }));

      expect(screen.getByRole('heading', { name: '2 search result' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Apply', exact: true })).toBeInTheDocument();
    });
  });
});
