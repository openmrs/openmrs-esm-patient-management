import React from 'react';
import { render, screen } from '@testing-library/react';
import RecentPatientSearch from './recent-patient-search.component';
import { useConfig } from '@openmrs/esm-framework';
import { type SearchedPatient } from '../types';
import { PatientSearchContext } from '../patient-search-context';

const mockedUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
}));

describe('RecentPatientSearch', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue({
      defaultIdentifierTypes: ['identifier-type-1', 'identifier-type-2'],
      search: {
        patientResultUrl: '/patient/{{patientUuid}}/chart',
      },
    });
  });

  it('should render loading skeleton when isLoading is true', () => {
    // @ts-ignore: Don't need the other props for this test
    render(<RecentPatientSearch isLoading={true} />);

    const resultText = screen.queryByText(/recent search result/i);
    expect(resultText).not.toBeInTheDocument();
  });

  it('should render error message when fetchError is true', () => {
    const error = new Error('Error');
    // @ts-ignore: Don't need the other props for this test
    render(<RecentPatientSearch fetchError={error} />);
    const errorMessage = screen.getByText('Error');

    expect(errorMessage).toBeInTheDocument();
  });

  it('should render search results when searchResults contain data', () => {
    const mockSearchResults = [
      {
        uuid: 'patient-1',
        identifiers: [{ identifier: '123', identifierType: { uuid: 'identifier-type-1' } }],
        person: {
          personName: {
            givenName: 'John',
            middleName: 'Doe',
          },
        },
      },
    ] as Array<SearchedPatient>;

    render(
      <PatientSearchContext.Provider value={{}}>
        {/* @ts-ignore: Don't need the other props for this test */}
        <RecentPatientSearch data={mockSearchResults} />
      </PatientSearchContext.Provider>,
    );
    const resultText = screen.getByText(/recent search result/i);

    expect(resultText).toBeInTheDocument();
  });

  it('should render empty result message when searchResults is empty', () => {
    // @ts-ignore: Don't need the other props for this test
    render(<RecentPatientSearch data={[]} />);
    const emptyResultText = screen.getByText(/no patient charts were found/i);

    expect(emptyResultText).toBeInTheDocument();
  });
});
