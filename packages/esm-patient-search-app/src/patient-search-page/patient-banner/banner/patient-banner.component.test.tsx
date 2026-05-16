import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigurableLink, useConfig } from '@openmrs/esm-framework';
import { type SearchedPatient } from '../../../types';
import PatientBanner from './patient-banner.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useConfig: jest.fn(),
  useVisit: jest.fn(() => ({ activeVisit: null })),
  useLayoutType: jest.fn(() => 'desktop'),
  ConfigurableLink: jest.fn(({ children, onBeforeNavigate }) => (
    <a href="#" onClick={onBeforeNavigate}>
      {children}
    </a>
  )),
  PatientPhoto: jest.fn(() => <div>Patient Photo</div>),
  PatientBannerPatientInfo: jest.fn(() => <div>Patient Info</div>),
  PatientBannerToggleContactDetailsButton: jest.fn(() => <button>Toggle Contact Details</button>),
}));

const mockUseConfig = jest.mocked(useConfig);

const patient: SearchedPatient = {
  uuid: 'test-patient-uuid',
  voided: false,
  identifiers: [],
  person: {
    addresses: [],
    age: 30,
    birthdate: '1990-01-01',
    gender: 'M',
    dead: false,
    deathDate: null,
    personName: {
      display: 'John Doe',
      givenName: 'John',
      familyName: 'Doe',
      middleName: '',
    },
  },
  attributes: [],
};

const fhirPatient: fhir.Patient = {
  id: 'test-patient-uuid',
  resourceType: 'Patient' as const,
} as fhir.Patient;

describe('PatientBanner', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      search: {
        patientChartUrl: '/patient/${patientUuid}/chart',
      },
    });
  });

  it('renders a button when onPatientSelected is provided', async () => {
    const onPatientSelected = jest.fn();
    const patientClickSideEffect = jest.fn();

    render(
      <PatientBanner
        patient={patient}
        patientUuid={patient.uuid}
        onPatientSelected={onPatientSelected}
        patientClickSideEffect={patientClickSideEffect}
      />,
    );

    const button = screen.getByRole('button', { name: /patient photo patient info/i });
    expect(button).toBeInTheDocument();

    await user.click(button);

    expect(onPatientSelected).toHaveBeenCalledWith(
      fhirPatient.id,
      expect.objectContaining({
        id: fhirPatient.id,
        resourceType: 'Patient',
      }),
      undefined,
      undefined,
    );
    expect(patientClickSideEffect).toHaveBeenCalledWith(
      fhirPatient.id,
      expect.objectContaining({
        id: fhirPatient.id,
        resourceType: 'Patient',
      }),
    );
  });

  it('renders a ConfigurableLink when onPatientSelected is NOT provided', async () => {
    const patientClickSideEffect = jest.fn();

    render(
      <PatientBanner patient={patient} patientUuid={patient.uuid} patientClickSideEffect={patientClickSideEffect} />,
    );

    // ConfigurableLink is mocked as an <a> tag
    const link = screen.getByRole('link', { name: /patient photo patient info/i });
    expect(link).toBeInTheDocument();
    expect(ConfigurableLink).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/patient/${patientUuid}/chart',
        templateParams: { patientUuid: patient.uuid },
      }),
      expect.anything(),
    );

    await user.click(link);

    expect(patientClickSideEffect).toHaveBeenCalledWith(
      fhirPatient.id,
      expect.objectContaining({
        id: fhirPatient.id,
        resourceType: 'Patient',
      }),
    );
  });

  it('calls onPatientSelected with workspace functions when provided', async () => {
    const onPatientSelected = jest.fn();
    const launchChildWorkspace = jest.fn();
    const closeWorkspace = jest.fn();

    render(
      <PatientBanner
        patient={patient}
        patientUuid={patient.uuid}
        onPatientSelected={onPatientSelected}
        launchChildWorkspace={launchChildWorkspace}
        closeWorkspace={closeWorkspace}
      />,
    );

    const button = screen.getByRole('button', { name: /patient photo patient info/i });
    await user.click(button);

    expect(onPatientSelected).toHaveBeenCalledWith(
      fhirPatient.id,
      expect.objectContaining({
        id: fhirPatient.id,
        resourceType: 'Patient',
      }),
      launchChildWorkspace,
      closeWorkspace,
    );
  });

  it('calls onPatientSelected before patientClickSideEffect', async () => {
    const calls: string[] = [];
    const onPatientSelected = jest.fn(() => calls.push('onPatientSelected'));
    const patientClickSideEffect = jest.fn(() => calls.push('patientClickSideEffect'));

    render(
      <PatientBanner
        patient={patient}
        patientUuid={patient.uuid}
        onPatientSelected={onPatientSelected}
        patientClickSideEffect={patientClickSideEffect}
      />,
    );

    const button = screen.getByRole('button', { name: /patient photo patient info/i });
    await user.click(button);

    expect(calls).toEqual(['onPatientSelected', 'patientClickSideEffect']);
  });
});
