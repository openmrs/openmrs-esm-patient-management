import { getDefaultsFromConfigSchema, useAppContext, useConfig } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import { mockPatientAlice, mockVisitAlice } from '__mocks__';
import React from 'react';
import { renderWithSwr } from 'tools';
import { mockInpatientAdmissionAlice } from '../../../../../__mocks__/inpatient-admission';
import { mockWardBeds } from '../../../../../__mocks__/wardBeds.mock';
import { mockWardViewContext } from '../../../mock';
import { configSchema, type WardConfigObject } from '../../config-schema';
import { useObs } from '../../hooks/useObs';
import { type WardPatient, type WardViewContext } from '../../types';
import MaternalWardPatientCard from './maternal-ward-patient-card.component';

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);
jest.mock('../../hooks/useObs', () => ({
  useObs: jest.fn(),
}));
jest.mock('../../ward-patient-card/row-elements/ward-patient-obs.resource', () => ({
  useConceptToTagColorMap: jest.fn(),
}));

const defaultConfig: WardConfigObject = getDefaultsFromConfigSchema(configSchema);

jest.mocked(useConfig).mockReturnValue(defaultConfig);
//@ts-ignore
jest.mocked(useObs).mockReturnValue({
  data: [],
});

describe('MaternalWardPatientCard', () => {
  it('renders a patient with no child', () => {
    const alice: WardPatient = {
      patient: mockPatientAlice,
      bed: mockWardBeds[0],
      inpatientAdmission: mockInpatientAdmissionAlice,
      visit: mockVisitAlice,
      inpatientRequest: null,
    };
    renderWithSwr(<MaternalWardPatientCard wardPatient={alice} childrenOfWardPatientInSameBed={[]} />);

    const patientName = screen.queryByText('Alice Johnson');
    expect(patientName).toBeInTheDocument();
  });

  it('renders a patient with another child in same bed', () => {
    const alice: WardPatient = {
      patient: mockPatientAlice,
      bed: mockWardBeds[0],
      inpatientAdmission: mockInpatientAdmissionAlice,
      visit: mockVisitAlice,
      inpatientRequest: null,
    };
    renderWithSwr(<MaternalWardPatientCard wardPatient={alice} childrenOfWardPatientInSameBed={[alice]} />);

    const bedDivider = screen.queryByText('Mother / Child');
    expect(bedDivider).toBeInTheDocument();
  });
});
