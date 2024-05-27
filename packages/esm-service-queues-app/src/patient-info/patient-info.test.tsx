import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import { age } from '@openmrs/esm-framework';
import { mockPatient, mockPatientWithLongName, mockPatientWithoutFormattedName } from 'tools';
import PatientInfo from './patient-info.component';

const mockAge = age as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    age: jest.fn(),
  };
});

describe('Patient Info', () => {
  it.each([
    [mockPatient, 'Wilson, John'],
    [mockPatientWithLongName, 'family name, Some very long given name'],
    [mockPatientWithoutFormattedName, 'given middle family name'],
  ])(`should render patient info correctly`, async (patient, displayName) => {
    const user = userEvent.setup();

    mockAge.mockReturnValue(35);

    renderPatientInfo(patient);

    expect(screen.getByText(new RegExp(displayName))).toBeInTheDocument();
    expect(screen.getByText(/35/)).toBeInTheDocument();
    expect(screen.getByText(/Male/i)).toBeInTheDocument();
    expect(screen.getByText(/04 — Apr — 1972/i)).toBeInTheDocument();
    expect(screen.getByText(/100732HE, 100GEJ/i)).toBeInTheDocument();

    const showDetailsButton = screen.getByText('Patient Banner Toggle Contact Details Button');
    expect(showDetailsButton).toBeInTheDocument();
  });
});

const renderPatientInfo = (patient) => {
  render(<PatientInfo handlePatientInfoClick={() => {}} patient={patient} />);
};
