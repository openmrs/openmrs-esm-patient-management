import React from 'react';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { configSchema, type PatientSearchConfig } from '../config-schema';
import { PatientSearchContext } from '../patient-search-context';
import RecentlySearchedPatients from './recently-searched-patients.component';

const defaultProps = {
  data: [],
  fetchError: null,
  isLoading: false,
};

const mockUseConfig = jest.mocked(useConfig<PatientSearchConfig>);

describe('RecentlySearchedPatients', () => {
  const birthdate = '1990-01-01T00:00:00.000+0000';
  const age = dayjs().diff(birthdate, 'years');
  
  // Mock FHIR Patient
  const mockSearchResults: Array<fhir.Patient> = [
    {
      resourceType: 'Patient',
      id: 'test-patient-uuid',
      identifier: [
        {
          id: '19e98c23-d26f-4668-8810-00da0e10e326',
          use: 'official',
          type: {
            text: 'OpenMRS ID',
            coding: [
              {
                code: '05a29f94-c0ed-11e2-94be-8c13b969e334',
                display: 'OpenMRS ID',
              },
            ],
          },
          value: '1000NLY',
        },
      ],
      name: [
        {
          given: ['John', 'Doe'],
          family: 'Smith',
          text: 'Smith, John Doe',
        },
      ],
      gender: 'male',
      birthDate: birthdate,
      deceasedBoolean: false,
      address: [],
      telecom: [],
    },
  ];

  beforeEach(() => mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema)));

  it('renders a loading state when fetching recently searched patients on initial render', () => {
    renderRecentlySearchedPatients({
      isLoading: true,
      data: undefined,
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders an empty state when there are no matching search results', () => {
    renderRecentlySearchedPatients({
      isLoading: false,
      data: [],
    });

    expect(screen.getByText(/no patient charts were found/i)).toBeInTheDocument();
    expect(screen.getByText(/try to search again using the patient's unique ID number/i)).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders an error state when search results fail to fetch', () => {
    const error = {
      message: 'You are not logged in',
      response: {
        status: 401,
        statusText: 'Unauthorized',
      },
    };

    renderRecentlySearchedPatients({
      fetchError: error,
      isLoading: false,
    });

    expect(screen.getByText(/sorry, there was an error. You can try to reload this page/i)).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders a list of recently searched patients', () => {
    renderRecentlySearchedPatients({
      data: mockSearchResults,
    });

    // TODO: Restore these tests once we improve the patient banner test stubs
    // expect(
    //   screen.getByRole('link', { name: new RegExp(`Smith, John Doe Male · ${age} yrs · OpenMRS ID 1000NLY`, 'i') }),
    // ).toBeInTheDocument();
    // expect(screen.getByRole('link')).toHaveAttribute(
    //   'href',
    //   `/openmrs/spa/patient/${mockSearchResults[0].id}/chart/`,
    // );
    // expect(screen.getByRole('heading', { name: /Smith, John Doe/i })).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText(/1 recent search result/i)).toBeInTheDocument();
  });

});

function renderRecentlySearchedPatients(props = {}) {
  render(
    <PatientSearchContext.Provider value={{}}>
      <RecentlySearchedPatients {...defaultProps} {...props} />
    </PatientSearchContext.Provider>,
  );
}