import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { PatientSearchContext } from '../patient-search-context';
import { configSchema } from '../config-schema';
import PatientSearch from './patient-search.component';

const defaultProps = {
  currentPage: 0,
  data: [],
  fetchError: null,
  hasMore: false,
  isLoading: false,
  isValidating: false,
  setPage: jest.fn(),
  totalResults: 1,
  query: 'John',
};

const mockUseConfig = jest.mocked(useConfig);

describe('PatientSearch', () => {
  beforeEach(() => mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema)));

  it('renders a loading state when search results are being fetched', () => {
    renderPatientSearch({ isLoading: true });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders an empty state when there are no matching search results', () => {
    renderPatientSearch({ isLoading: false, data: [] });
    expect(screen.getByText(/no patient charts were found/i)).toBeInTheDocument();
    expect(screen.getByText(/try to search again using the patient's unique ID number/i)).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders an error state when search results fail to fetch', () => {
    const error = {
      message: 'You are not logged in',
      response: { status: 401, statusText: 'Unauthorized' },
    };

    renderPatientSearch({ fetchError: error, isLoading: false });
    expect(screen.getByText(/sorry, there was an error. You can try to reload this page/i)).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders a list of recently searched patients', () => {
    const birthDate = '1990-01-01';

    const mockSearchResults: Array<fhir.Patient> = [
      {
        resourceType: 'Patient',
        id: 'test-patient-uuid',
        name: [
          {
            family: 'Smith',
            given: ['John', 'Doe'],
          },
        ],
        gender: 'male',
        birthDate: birthDate,
        identifier: [
          {
            system: 'OpenMRS ID',
            value: '1000NLY',
          },
        ],
        deceasedBoolean: false,
      },
    ];

    renderPatientSearch({
      currentPage: 0,
      data: mockSearchResults,
      hasMore: false,
      totalResults: 1,
    });

    // TODO: Restore detailed tests once patient banner test stubs are improved
    // expect(screen.getByRole('link', { name: new RegExp(`Smith, John Doe Male · ${age} yrs · OpenMRS ID 1000NLY`, 'i') })).toBeInTheDocument();
    // expect(screen.getByRole('link')).toHaveAttribute('href', `/openmrs/spa/patient/${mockSearchResults[0].id}/chart/`);
    // expect(screen.getByRole('heading', { name: /Smith, John Doe/ })).toBeInTheDocument();
    expect(screen.getByText('Patient Photo')).toBeInTheDocument();
  });
});

function renderPatientSearch(props = {}) {
  render(
    <PatientSearchContext.Provider value={{}}>
      <PatientSearch {...defaultProps} {...props} />
    </PatientSearchContext.Provider>,
  );
}
