import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, restBaseUrl, useConfig } from '@openmrs/esm-framework';
import { PatientSearchContext } from '../patient-search-context';
import { configSchema } from '../config-schema';
import { type SearchedPatient } from '../types';
import PatientSearch from './patient-search.component';

const mockedUseConfig = jest.mocked(useConfig);

describe('PatientSearch', () => {
  beforeEach(() => mockedUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema)));

  it('renders a loading state when search results are being fetched', () => {
    renderPatientSearch({
      isLoading: true,
    });

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders an empty state when there are no matching search results', () => {
    renderPatientSearch({
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

    renderPatientSearch({
      fetchError: error,
      isLoading: false,
    });

    expect(screen.getByText(/sorry, there was an error. You can try to reload this page/i)).toBeInTheDocument();
    expect(screen.queryByText(/recent search result/i)).not.toBeInTheDocument();
  });

  it('renders a list of recently searched patients', () => {
    const mockSearchResults: Array<SearchedPatient> = [
      {
        attributes: [],
        identifiers: [
          {
            display: 'OpenMRS ID = 1000NLY',
            uuid: '19e98c23-d26f-4668-8810-00da0e10e326',
            identifier: '1000NLY',
            identifierType: {
              uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
              display: 'OpenMRS ID',
              links: [
                {
                  rel: 'self',
                  uri: `http://dev3.openmrs.org/openmrs/${restBaseUrl}/patientidentifiertype/05a29f94-c0ed-11e2-94be-8c13b969e334`,
                  resourceAlias: 'patientidentifiertype',
                },
              ],
            },
            location: {
              uuid: '44c3efb0-2583-4c80-a79e-1f756a03c0a1',
              display: 'Outpatient Clinic',
            },
          },
        ],
        person: {
          age: 34,
          addresses: [],
          birthdate: '1990-01-01',
          dead: false,
          deathDate: null,
          gender: 'M',
          personName: {
            display: 'John Doe Smith',
            givenName: 'John',
            middleName: 'Doe',
            familyName: 'Smith',
          },
        },
        uuid: 'test-patient-uuid',
      },
    ];

    renderPatientSearch({
      currentPage: 0,
      data: mockSearchResults,
      hasMore: false,
      totalResults: 1,
    });

    expect(
      screen.getByRole('link', { name: /John Doe Smith Male · 34 yrs · OpenMRS ID 1000NLY/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      `/openmrs/spa/patient/${mockSearchResults[0].uuid}/chart/`,
    );
    expect(screen.getByRole('heading', { name: /John Doe Smith/ })).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});

function renderPatientSearch(otherProps = {}) {
  const mockProps = {
    currentPage: 0,
    data: [],
    fetchError: null,
    hasMore: false,
    isLoading: false,
    loadingNewData: false,
    setPage: jest.fn(),
    totalResults: 1,
    query: 'John',
  };

  return render(
    <PatientSearchContext.Provider value={{}}>
      <PatientSearch {...mockProps} {...otherProps} />
    </PatientSearchContext.Provider>,
  );
}
