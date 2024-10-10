import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type WardConfigObject } from '../config-schema';
import {
  mockAdmissionLocation,
  mockLocationInpatientWard,
  mockPatientAlice,
  mockPatientBrian,
} from '../../../../__mocks__';
import { bedLayoutToBed, filterBeds } from '../ward-view/ward-view.resource';
import useWardLocation from '../hooks/useWardLocation';
import WardBed from './ward-bed.component';
import { type WardPatient } from '../types';
import DefaultWardPatientCard from '../ward-view/default-ward/default-ward-patient-card.component';

const defaultConfig: WardConfigObject = getDefaultsFromConfigSchema(configSchema);

jest.mocked(useConfig).mockReturnValue(defaultConfig);

const mockBedLayouts = filterBeds(mockAdmissionLocation);

jest.mock('../hooks/useWardLocation', () => jest.fn());

const mockedUseWardLocation = useWardLocation as jest.Mock;
mockedUseWardLocation.mockReturnValue({
  location: mockLocationInpatientWard,
  isLoadingLocation: false,
  errorFetchingLocation: null,
  invalidLocation: false,
});

const mockBedToUse = mockBedLayouts[0];
const mockBed = bedLayoutToBed(mockBedToUse);

const mockWardPatientAliceProps: WardPatient = {
  visit: null,
  patient: mockPatientAlice,
  bed: mockBed,
  inpatientAdmission: null,
  inpatientRequest: null,
};

const mockWardPatientBrianProps: WardPatient = {
  visit: null,
  patient: mockPatientBrian,
  bed: mockBed,
  inpatientAdmission: null,
  inpatientRequest: null,
};

describe('Ward bed', () => {
  it('renders a single bed with patient details', () => {
    render(
      <WardBed
        patientCards={[<DefaultWardPatientCard key={mockPatientAlice.uuid} {...mockWardPatientAliceProps} />]}
        bed={mockBed}
      />,
    );
    const patientName = screen.getByText('Alice Johnson');
    expect(patientName).toBeInTheDocument();
    const patientAge = `${mockPatientAlice.person.age} yrs`;
    expect(screen.getByText(patientAge)).toBeInTheDocument();
  });

  it('renders a divider for shared patients', () => {
    render(
      <WardBed
        bed={mockBed}
        patientCards={[
          <DefaultWardPatientCard key={mockPatientAlice.uuid} {...mockWardPatientAliceProps} />,
          <DefaultWardPatientCard key={mockPatientBrian.uuid} {...mockWardPatientBrianProps} />,
        ]}
      />,
    );
    const bedShareText = screen.getByTitle('Bed share');
    expect(bedShareText).toBeInTheDocument();
  });
});
