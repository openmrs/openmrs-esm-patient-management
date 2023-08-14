import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientSearchResults from './compact-patient-banner.component';
import { useConfig } from '@openmrs/esm-framework';

const mockedUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
}));

describe('Compact Patient Search Results', () => {
  beforeEach(() => {
    mockedUseConfig.mockReturnValue({
      defaultIdentifierTypes: ['identifier-type-1', 'identifier-type-2'],
      search: {
        patientResultUrl: '/patient/{{patientUuid}}/chart',
      },
    });
  });
  const patients = [
    {
      uuid: 'patient-1',
      person: {
        personName: {
          givenName: 'John',
          middleName: 'Doe',
          familyName: 'Smith',
        },
        gender: 'M',
        birthdate: '1990-01-01',
      },
      identifiers: [{ identifier: '123', identifierType: { uuid: 'identifier-type-1' } }],
    },
  ];

  it('should render patient search results', () => {
    render(<PatientSearchResults patients={patients} />);

    expect(screen.getByText('John Doe Smith')).toBeInTheDocument();

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  // Fix this test later
  // it('should call selectPatientAction when a patient is clicked', () => {
  //   const selectPatientActionMock = jest.fn();
  //   render(<PatientSearchResults patients={patients} selectPatientAction={selectPatientActionMock} />);

  //   fireEvent.click(screen.getByText('John Doe Smith'));
  //   expect(selectPatientActionMock).toBeCalledWith(patients[0]);
  // });
});
