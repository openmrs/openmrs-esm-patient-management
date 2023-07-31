import React from 'react';
import { screen, render } from '@testing-library/react';
import { age } from '@openmrs/esm-framework';
import SearchResults from './search-results.component';

const mockAge = age as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    age: jest.fn(),
  };
});

const patients = [
  {
    id: 'b73bee73-7bf0-4872-9657-ba9de0d93478',
    name: [{ given: ['John'], family: 'Smith' }],
    person: {
      gender: 'Male',
      age: 2,
      birthdate: '2020-02-01T00:00:00.000+0000',
      birthdateEstimated: true,
      personName: {
        display: 'John Smith',
        uuid: '27698bff-4056-430c-824c-cb18cf9329d8',
        givenName: 'John',
        middleName: null,
        familyName: 'Smith',
        familyName2: null,
        voided: false,
      },
      addresses: [
        {
          display: 'Bom Jesus Street',
          uuid: '7eab94da-4b33-4da9-b352-da21a571221a',
          preferred: true,
          address1: 'Bom Jesus Street',
          address2: null,
          cityVillage: 'Recife',
          stateProvince: 'Pernambuco',
          country: 'Brazil',
          postalCode: '50030-310',
          countyDistrict: null,
        },
      ],
      display: 'John Smith',
      dead: false,
      deathDate: null,
    },
    gender: 'Male',
    birthDate: '2020-02-01T00:00:00.000+0000',
    deceasedDateTime: null,
    identifier: [{ value: '10001F0' }],
    address: [{ city: 'Recife', country: 'Brazil', postalCode: '50030-310', state: 'Pernambuco', use: 'home' }],
    telecom: [],
    patientIdentifier: { identifier: [{ value: '10001F0' }] },
  },
];

const mockToggleSearchType = jest.fn();

describe('Search Results', () => {
  it('should search results page', () => {
    mockAge.mockReturnValue(35);
    renderSearchResults();
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
    expect(screen.getByText(/35/)).toBeInTheDocument();
    expect(screen.getByText(/Male/)).toBeInTheDocument();
    expect(screen.getByText(/01 — Feb — 2020/i)).toBeInTheDocument();
  });
});

const renderSearchResults = () => {
  render(<SearchResults patients={patients} toggleSearchType={mockToggleSearchType} />);
};
