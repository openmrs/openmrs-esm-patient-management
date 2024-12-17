import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useInfinitePatientSearch } from '../patient-search.resource';
import AdvancedPatientSearchComponent from './advanced-patient-search.component';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import { type PatientSearchResponse } from '../types';
import { mockAdvancedSearchResults } from '__mocks__';
import { PatientSearchContext } from '../patient-search-context';
import { usePersonAttributeType } from './refine-search/person-attributes.resource';

const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);
const mockUseInfinitePatientSearch = jest.mocked(useInfinitePatientSearch);
const mockUsePersonAttributeType = jest.mocked(usePersonAttributeType);

jest.mock('../patient-search.resource', () => ({
  useInfinitePatientSearch: jest.fn(),
}));

jest.mock('./refine-search/person-attributes.resource', () => ({
  usePersonAttributeType: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => ({
    page: 1,
  })),
  useLocation: jest.fn(),
  useSearchParams: jest.fn(() => [
    {
      get: jest.fn(() => 'Jos'),
    },
  ]),
}));

const mockPatientActionContextValue = {
  nonNavigationSelectPatientAction: jest.fn(),
  selectPatientAction: jest.fn(),
};

const mockSearchResults: PatientSearchResponse = {
  isValidating: false,
  totalResults: 2,
  data: mockAdvancedSearchResults as unknown as PatientSearchResponse['data'],
  currentPage: 1,
  setPage: jest.fn(),
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

      // expect to have 0 search result
      expect(screen.getByText(/0 search result/)).toBeInTheDocument();
    });

    it('filters by age correctly', async () => {
      renderComponent();

      // Set age filter
      const ageInput = screen.getByRole('spinbutton', { name: /age/i });
      await user.type(ageInput, '30');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // expect one patient Joseph Davis
      const patientBanners = screen.getAllByRole('banner');
      expect(patientBanners).toHaveLength(1);
      expect(within(patientBanners[0]).getByText(/Joseph Davis/i)).toBeInTheDocument();
      expect(within(patientBanners[0]).getByText(/30/)).toBeInTheDocument();
    });

    it('filters by postcode correctly', async () => {
      renderComponent();

      // Set postcode filter
      const postcodeInput = screen.getByRole('textbox', { name: /postcode/i });
      await user.type(postcodeInput, '46548');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // expect one patient Joseph Davis

      const patientBanners = screen.getAllByRole('banner');
      expect(patientBanners).toHaveLength(1);
      expect(within(patientBanners[0]).getByText(/Joseph Davis/i)).toBeInTheDocument();
    });

    it('filters by person attribute correctly', async () => {
      renderComponent();

      // Set phone number attribute filter
      const phoneInput = screen.getByLabelText(/phone number/i);
      await user.type(phoneInput, '0785434125');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // expect one patient Joshua Johnson

      const patientBanners = screen.getAllByRole('banner');
      expect(patientBanners).toHaveLength(1);
      expect(within(patientBanners[0]).getByText(/Joshua Johnson/)).toBeInTheDocument();
    });

    it('combines multiple filters correctly', async () => {
      renderComponent();

      // Set multiple filters
      await user.click(screen.getByRole('tab', { name: /any/i }));
      const ageInput = screen.getByRole('spinbutton', { name: /age/i });
      await user.type(ageInput, '5');
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // expect one patient Joshua Johnson

      const patientBanners = screen.getAllByRole('banner');
      expect(patientBanners).toHaveLength(1);
      expect(within(patientBanners[0]).getByText(/Joshua Johnson/)).toBeInTheDocument();
    });

    it('resets filters correctly', async () => {
      renderComponent();

      // Set a filter
      await user.click(screen.getByRole('tab', { name: /female/i }));
      await user.click(screen.getByRole('button', { name: /apply/i }));

      // Reset filters
      await user.click(screen.getByRole('button', { name: /reset fields/i }));

      // expects all search results 2 patients
      const patientBanners = screen.getAllByRole('banner');
      expect(patientBanners).toHaveLength(2);
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
});
