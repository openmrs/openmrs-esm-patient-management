import { render, screen } from '@testing-library/react';
import OccupiedBed from './occupied-bed.component';
import React from 'react';
import { mockAdmissionLocation } from '../../../../__mocks__/wards.mock';
import { bedLayoutToBed, filterBeds } from '../ward-view/ward-view.resource';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, defaultPatientCardElementConfig } from '../config-schema';

const defaultConfig = getDefaultsFromConfigSchema(configSchema);

jest.mocked(useConfig).mockReturnValue(defaultConfig);

const mockBedLayouts = filterBeds(mockAdmissionLocation);

const mockBedToUse = mockBedLayouts[0];
jest.replaceProperty(mockBedToUse.patients[0].person, 'preferredName', {
  uuid: '',
  givenName: 'Alice',
  familyName: 'Johnson',
});
const mockPatient = mockBedToUse.patients[0];
const mockBed = bedLayoutToBed(mockBedToUse);

describe('Occupied bed: ', () => {
  it('renders a single bed with patient details', () => {
    render(<OccupiedBed patientInfos={[{ patient: mockPatient, visit: null }]} bed={mockBed} />);
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
        patientInfos={[
          { patient: mockPatient, visit: null },
          { patient: mockPatient, visit: null },
        ]}
        bed={mockBed}
      />,
    );
    const bedShareText = screen.getByTitle('Bed share');
    expect(bedShareText).toBeInTheDocument();
  });
});
