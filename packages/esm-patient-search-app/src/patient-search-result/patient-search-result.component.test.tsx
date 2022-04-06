import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientSearchResults from './patient-search-result.component';
import { SearchedPatient } from '../types/index';
import { useConfig, ExtensionSlot } from '@openmrs/esm-framework';

const mockSearchResults: SearchedPatient[] = [
  {
    patientId: 20,
    uuid: 'cc75ad73-c24b-499c-8db9-a7ef4fc0b36d',
    identifiers: [
      {
        display: 'OpenMRS ID = 10000F1',
        uuid: '',
        identifier: '10000F1',
        identifierType: {
          uuid: '',
          display: '',
        },
        location: {
          uuid: '',
          display: '',
        },
        preferred: true,
        voided: false,
      },
    ],
    patientIdentifier: {
      identifier: '10000F1',
    },
    person: {
      addresses: [
        {
          preferred: false,
          cityVillage: 'Test City',
          country: 'Test Country',
          postalCode: '000000',
          stateProvince: 'Test State',
        },
      ],
      age: 35,
      birthdate: '1986-04-03T00:00:00.000+0000',
      display: 'Eric Test Ric',
      gender: 'M',
      death: false,
      deathDate: null,
      personName: {
        givenName: 'Eric',
        familyName: 'Ric',
        middleName: 'Test',
      },
    },
    attributes: [
      {
        value: null,
        attributeType: {
          name: null,
        },
      },
    ],
    display: '10000F1 - Eric Test Ric',
  },
];

const mockUseConfig = useConfig as jest.Mock;

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  ExtensionSlot: jest
    .fn()
    .mockImplementation((props: any) =>
      props.state.hideActionsOverflow ? 'Actions overlay is hidden' : 'Actions overlay is visible',
    ),
}));

describe('PatientSearchResults: ', () => {
  it('should show action overlay when hideActionsOverflow config is false', () => {
    const mockConfig = { search: { hideActionsOverflow: false } };
    mockUseConfig.mockReturnValue(mockConfig);

    render(<PatientSearchResults patients={mockSearchResults} />);

    expect(screen.getByText('Actions overlay is visible')).toBeInTheDocument();
  });

  it('should not show action overlay when hideActionsOverflow config is true', () => {
    const mockConfig = { search: { hideActionsOverflow: true } };
    mockUseConfig.mockReturnValue(mockConfig);

    render(<PatientSearchResults patients={mockSearchResults} />);

    expect(screen.getByText('Actions overlay is hidden')).toBeInTheDocument();
  });
});
