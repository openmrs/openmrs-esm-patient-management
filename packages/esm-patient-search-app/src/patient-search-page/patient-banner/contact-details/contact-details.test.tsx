import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithSwr } from 'tools';
import { usePatientAttributes, usePatientContactAttributes } from '../hooks/usePatientAttributes';
import { usePatientListsForPatient } from '../hooks/usePatientListsForPatient';
import { useRelationships } from './relationships.resource';
import ContactDetails from './contact-details.component';
import { usePatient } from '@openmrs/esm-framework';

const mockedUsePatient = usePatient as jest.Mock;
const mockedUsePatientAttributes = usePatientAttributes as jest.Mock;
const mockedUsePatientContactAttributes = usePatientContactAttributes as jest.Mock;
const mockUsePatientListsForPatient = usePatientListsForPatient as jest.Mock;
const mockUseRelationships = useRelationships as jest.Mock;

const mockRelationships = [
  {
    display: '100ADT - Amanda Robinson',
    name: 'Amanda Robinson',
    relationshipType: 'Sibling',
    relativeAge: 24,
    relativeUuid: '07006bcb-91d4-4c57-a5f7-49751899d9b5',
    uuid: '993bc79d-5ca5-4c76-b4b3-adf49e25bd0b',
  },
];

const mockPersonAttributes = [
  {
    display: 'Next of Kin Contact Phone Number = 0000000000',
    uuid: '1de1ac71-68e8-4a08-a7e2-5042093d4e46',
    value: '0700-000-000',
    attributeType: {
      uuid: 'a657a4f1-9c0f-444b-a1fd-445bb91dd12d',
      display: 'Next of Kin Contact Phone Number',
    },
  },
  {
    display: 'Phone number',
    uuid: 'asdflkjhasdf',
    value: '+0123456789',
    attributeType: {
      uuid: 'qweproiuqweproiu',
      display: 'Phone number',
    },
  },
];

const mockCohorts = [
  {
    uuid: 'fdc95682-e206-421b-9534-e2a4010cc05d',
    name: 'List three',
    startDate: '2023-04-19T23:26:27.000+0000',
    endDate: null,
  },
  {
    uuid: '1d48bec7-6aab-464c-ac16-687ba46e7812',
    name: ' Test patient List-47',
    startDate: '2023-04-24T23:28:49.000+0000',
    endDate: null,
  },
  {
    uuid: '6ce81b61-387d-43ab-86fb-606fa16d39dd',
    name: ' Test patient List-41',
    startDate: '2023-04-24T23:28:49.000+0000',
    endDate: null,
  },
  {
    uuid: '1361caf0-b3c3-4937-88e3-40074f7f3320',
    name: 'Potential Patients',
    startDate: '2023-06-07T15:40:00.000+0000',
    endDate: null,
  },
];

jest.mock('../hooks/usePatientAttributes', () => ({
  usePatientAttributes: jest.fn(),
  usePatientContactAttributes: jest.fn(),
}));

jest.mock('../hooks/usePatientListsForPatient', () => ({
  usePatientListsForPatient: jest.fn(),
}));

jest.mock('./relationships.resource', () => ({
  useRelationships: jest.fn(),
}));

describe('ContactDetails', () => {
  beforeEach(() => {
    mockedUsePatient.mockReturnValue({
      isLoading: false,
      patient: {
        address: [
          {
            city: 'Foo',
            country: 'Bar',
            id: '0000',
            postalCode: '00100',
            state: 'Quux',
            use: 'home',
          },
        ],
        telecom: [{ system: 'Cellular', value: '+0123456789' }],
      },
    });
    mockedUsePatientContactAttributes.mockReturnValue({
      isLoading: false,
      contactAttributes: mockPersonAttributes,
    });

    mockUsePatientListsForPatient.mockReturnValue({
      isLoading: false,
      cohorts: mockCohorts,
    });

    mockUseRelationships.mockReturnValue({
      isLoading: false,
      data: mockRelationships,
    });
  });

  it("renders the patient's address, contact details, patient lists, and relationships when available", async () => {
    renderWithSwr(<ContactDetails patientId={'some-uuid'} deceased={false} />);

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText(/Amanda Robinson/)).toBeInTheDocument();
    expect(screen.getByText(/Sibling/i)).toBeInTheDocument();
    expect(screen.getByText(/24 yrs/i)).toBeInTheDocument();
    expect(screen.getByText(/\+0123456789/i)).toBeInTheDocument();
    expect(screen.getByText(/Next of Kin Contact Phone Number/i)).toBeInTheDocument();
    expect(screen.getByText(/0700-000-000/)).toBeInTheDocument();
    expect(screen.getByText(/Patient Lists/)).toBeInTheDocument();
    expect(screen.getByText(/Test patient List-47/)).toBeInTheDocument();
    expect(screen.getByText(/List three/)).toBeInTheDocument();
  });

  it('renders an empty state view when contact details, relations, patient lists and addresses are not available', async () => {
    mockedUsePatient.mockReturnValue({
      isLoading: false,
      address: [],
    });
    mockedUsePatientAttributes.mockReturnValue({
      isLoading: false,
      attributes: [],
      error: null,
    });
    mockedUsePatientContactAttributes.mockReturnValue({
      isLoading: false,
      contactAttributes: [],
    });
    mockUsePatientListsForPatient.mockReturnValue({
      isLoading: false,
      cohorts: [],
    });
    mockUseRelationships.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithSwr(<ContactDetails patientId={'some-uuid'} deceased={false} />);

    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Relationships')).toBeInTheDocument();
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
    expect(screen.getByText(/Patient Lists/)).toBeInTheDocument();
    expect(screen.getAllByText('--').length).toBe(4);
  });
});
