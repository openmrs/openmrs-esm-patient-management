import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { render, screen } from '@testing-library/react';
import React from 'react';
import {
  mockAdmissionLocation,
  mockLocationInpatientWard,
  mockPatientAlice,
  mockPatientBrian,
} from '../../../../__mocks__';
import { configSchema, type WardConfigObject } from '../config-schema';
import { useObs } from '../hooks/useObs';
import useWardLocation from '../hooks/useWardLocation';
import { type WardPatient } from '../types';
import DefaultWardPatientCard from '../ward-view/default-ward/default-ward-patient-card.component';
import { bedLayoutToBed, filterBeds } from '../ward-view/ward-view.resource';
import WardBed from './ward-bed.component';

const defaultConfig: WardConfigObject = getDefaultsFromConfigSchema(configSchema);

jest.mocked(useConfig).mockReturnValue(defaultConfig);
jest.mock('../hooks/useObs', () => ({
  useObs: jest.fn(),
}));
jest.mock('../ward-patient-card/row-elements/ward-patient-obs.resource', () => ({
  useConceptToTagColorMap: jest.fn(),
}));

const mockBedLayouts = filterBeds(mockAdmissionLocation);

jest.mock('../hooks/useWardLocation', () => jest.fn());
//@ts-ignore
jest.mocked(useObs).mockReturnValue({
  data: [],
});

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
        patientCards={[<DefaultWardPatientCard key={mockPatientAlice.uuid} wardPatient={mockWardPatientAliceProps} />]}
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
          <DefaultWardPatientCard key={mockPatientAlice.uuid} wardPatient={mockWardPatientAliceProps} />,
          <DefaultWardPatientCard key={mockPatientBrian.uuid} wardPatient={mockWardPatientAliceProps} />,
        ]}
      />,
    );
    const bedShareText = screen.getByTitle('Bed share');
    expect(bedShareText).toBeInTheDocument();
  });
});
