import { render, screen } from '@testing-library/react';
import OccupiedBed from './occupied-bed.component';
import React from 'react';
import { mockAdmissionLocation } from '../../../../__mocks__/wards.mock';
import { bedLayoutToBed, filterBeds } from '../ward-view/ward-view.resource';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, deafultCardDefinitions, defaultAddressFields } from '../config-schema';

const defaultConfigSchema = getDefaultsFromConfigSchema(configSchema);

jest.mocked(useConfig).mockReturnValue({
  ...defaultConfigSchema,
});

const mockBedLyouts = filterBeds(mockAdmissionLocation);

const mockBedToUse = mockBedLyouts[0];
jest.replaceProperty(mockBedToUse.patient.person, 'preferredName', {
  uuid: '',
  givenName: 'Alice',
  familyName: 'Johnson',
});
const mockPatient = mockBedToUse.patient;
const mockBed = bedLayoutToBed(mockBedToUse);
const configAddressFields = defaultAddressFields;
const cardDefinitions = deafultCardDefinitions.map((cardDef) => cardDef.slots);

describe('Occupied bed: ', () => {
  it('renders a single bed with patient details', () => {
    render(<OccupiedBed patients={[mockPatient]} bed={mockBed} />);
    const patientName = screen.getByText('Alice Johnson');
    expect(patientName).toBeInTheDocument();
    const patientAge = `${mockPatient.person.age} yrs`;
    expect(screen.getByText(patientAge)).toBeInTheDocument();
    configAddressFields.forEach((addressField) => {
      const addressFieldValue = mockPatient.person.preferredAddress[addressField];
      expect(screen.getByText(addressFieldValue)).toBeInTheDocument();
    });
  });

  it('renders a divider for shared patients', () => {
    render(<OccupiedBed patients={[mockPatient, mockPatient]} bed={mockBed} />);
    const bedShareText = screen.getByTitle('Bed share');
    expect(bedShareText).toBeInTheDocument();
  });

  it('check if the card definition slots are rendered', () => {
    const { container } = render(<OccupiedBed patients={[mockPatient]} bed={mockBed} />);
    cardDefinitions.forEach((cardDefs) => {
      cardDefs.forEach((cardDef) => {
        const cardSlot = container.querySelector(`[data-card-slot-id="${cardDef}"]`);
        expect(cardSlot).toBeInTheDocument();
      });
    });
  });
});
