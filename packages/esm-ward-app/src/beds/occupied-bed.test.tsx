import { render, screen } from '@testing-library/react';
import OccupiedBed from './occupied-bed.component';
import React from 'react';
import { mockAdmissionLocation } from '../../../../__mocks__/wards.mock';
import { bedLayoutToBed, filterBeds } from '../ward-view/ward-view.resource';
import { getDefaultsFromConfigSchema, useConfig, usePatient } from '@openmrs/esm-framework';
import { configSchema, defaultPatientCardElementConfig } from '../config-schema';
import { mockAdmittedPatient } from '../../../../__mocks__/ward-patient';
import { mockPatientBrian } from '__mocks__';

const defaultConfig = getDefaultsFromConfigSchema(configSchema);

jest.mocked(useConfig).mockReturnValue(defaultConfig);

const mockBedLayouts = filterBeds(mockAdmissionLocation);

const mockBedToUse = mockBedLayouts[0];
jest.replaceProperty(mockBedToUse.patients[0].person, 'preferredName', {
  uuid: '',
  givenName: 'Alice',
  familyName: 'Johnson',
});
const mockBed = bedLayoutToBed(mockBedToUse);

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    usePatient: jest.fn(),
  };
});

const mockedUsePatient = usePatient as jest.Mock;

describe('Occupied bed: ', () => {
  beforeAll(() => {
    mockedUsePatient.mockReturnValue({
      patient: {
        ...mockAdmittedPatient.patient,
        name: [
          {
            id: 'efdb246f-4142-4c12-a27a-9be60b9592e9',
            use: 'usual',
            family: 'Johnson',
            given: ['Alice'],
          },
        ],
      },
      isLoading: false,
      error: null,
      patientUuid: mockAdmittedPatient.patient.uuid,
    });
  });

  it('renders a single bed with patient details', () => {
    const mockPatient = mockAdmittedPatient.patient;
    render(<OccupiedBed wardPatients={[{ ...mockAdmittedPatient, admitted: true }]} bed={mockBed} />);
    const patientName = screen.getByText('Alice Johnson');
    expect(patientName).toBeInTheDocument();
    const patientAge = `${mockPatient.person.age} yrs`;
    expect(screen.getByText(patientAge)).toBeInTheDocument();
    const defaultAddressFields = defaultPatientCardElementConfig.address.addressFields;
    defaultAddressFields.forEach((addressField) => {
      const addressFieldValue = mockPatient.person.preferredAddress[addressField] as string;
      expect(screen.getByText(addressFieldValue)).toBeInTheDocument();
    });
  });

  it('renders a divider for shared patients', () => {
    render(
      <OccupiedBed
        wardPatients={[
          { ...mockAdmittedPatient, admitted: true },
          { ...mockAdmittedPatient, patient: mockPatientBrian, admitted: true },
        ]}
        bed={mockBed}
      />,
    );
    const bedShareText = screen.getByTitle('Bed share');
    expect(bedShareText).toBeInTheDocument();
  });
});
