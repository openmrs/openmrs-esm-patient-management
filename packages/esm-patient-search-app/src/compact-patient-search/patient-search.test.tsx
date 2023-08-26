import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientSearch from './patient-search.component';
import { useConfig } from '@openmrs/esm-framework';

const mockedUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
}));

describe('PatientSearch', () => {
  const mockProps = {
    query: 'John',
    isLoading: false,
    data: [
      {
        uuid: '6baa7963-68ea-497e-b258-6fb82382bd07',
        person: {
          personName: {
            givenName: 'John',
            middleName: 'Doe',
            familyName: 'Smith',
          },
          gender: 'M',
          birthdate: '1990-01-01',
        },
        identifiers: [
          {
            identifierType: {
              uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
              display: 'National ID',
            },
            identifier: '123456',
          },
        ],
      },
    ],
    fetchError: false,
    loadingNewData: false,
    setPage: jest.fn(),
    hasMore: false,
    totalResults: 1,
  };

  beforeEach(() => {
    mockedUseConfig.mockReturnValue({
      defaultIdentifierTypes: ['identifier-type-1', 'identifier-type-2'],
      search: {
        patientResultUrl: '/patient/{{patientUuid}}/chart',
      },
    });
  });

  it('should render search results correctly', () => {
    render(<PatientSearch currentPage={0} {...mockProps} />);

    const resultsTextElement = screen.getByText('John Doe Smith');
    expect(resultsTextElement).toBeInTheDocument();
  });

  it('should render loading state correctly', () => {
    render(<PatientSearch currentPage={0} {...mockProps} isLoading={true} />);

    const skeletonAvatar = screen.getAllByTestId('search-skeleton');
    expect(skeletonAvatar.length).toBeGreaterThan(0);
  });

  it('should render error state correctly', () => {
    const error = new Error('Error');
    render(<PatientSearch {...mockProps} fetchError={error} />);

    const errorMessageElement = screen.getByText('Error');
    expect(errorMessageElement).toBeInTheDocument();
  });
});
