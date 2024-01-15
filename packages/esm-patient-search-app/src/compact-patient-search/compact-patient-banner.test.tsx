import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import PatientSearchResults from './compact-patient-banner.component';
import { useConfig } from '@openmrs/esm-framework';
import { type SearchedPatient } from '../types';
import { PatientSearchContext } from '../patient-search-context';

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
  ] as Array<SearchedPatient>;

  it('should render patient search results', () => {
    render(
      <PatientSearchContext.Provider value={{}}>
        <PatientSearchResults patients={patients} />
      </PatientSearchContext.Provider>,
    );

    expect(screen.getByText('John Doe Smith')).toBeInTheDocument();

    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  // Fix this test later
  // const user = userEvent.setup();
  // it('should call selectPatientAction when a patient is clicked', async () => {
  //   const selectPatientActionMock = jest.fn();
  //   render(<PatientSearchResults patients={patients} selectPatientAction={selectPatientActionMock} />);

  //   user.click(screen.getByText('John Doe Smith'));
  //   expect(selectPatientActionMock).toHaveBeenCalledWith(patients[0]);
  // });
});
