import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, usePatient } from '@openmrs/esm-framework';
import { mockPatient, mockServices, mockProviders } from '../../__mocks__/appointments.mock';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { mockSession } from '../../../../__mocks__/session.mock';
import { MappedAppointment } from '../types';
import AppointmentForm from './appointments-form.component';

const mockedUseConfig = useConfig as jest.Mock;
const mockedUsePatient = usePatient as jest.Mock;

function renderAppointmentsForm(context: string, patientUuid?: string, appointment?: MappedAppointment) {
  render(<AppointmentForm patientUuid={patientUuid} context={context} appointment={appointment} />);
}

jest.mock('./appointment-forms.resource.ts', () => {
  const originalModule = jest.requireActual('./appointment-forms.resource.ts');

  return {
    ...originalModule,
    useServices: jest.fn().mockReturnValue({ services: mockServices }),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    openmrsFetch: jest.fn(),
    useLocations: jest.fn().mockImplementation(() => mockLocations.data),
    useSession: jest.fn().mockImplementation(() => mockSession.data),
    useProviders: jest.fn().mockImplementation(() => mockProviders.data),
  };
});

let mockOpenmrsConfig = {
  daysOfTheWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  appointmentKinds: ['Scheduled', 'WalkIn', 'Virtual'],
  appointmentStatuses: ['Requested', 'Scheduled', 'CheckedIn', 'Completed', 'Cancelled', 'Missed'],
};

describe('AppointmentForm', () => {
  const patient = mockPatient;
  beforeEach(() => {
    mockedUseConfig.mockReturnValue(mockOpenmrsConfig);
    mockedUsePatient.mockReturnValue({
      patient,
      isLoading: false,
      error: null,
      patientUuid: patient.uuid,
    });
  });

  it('renders the patient banner with the right patient', () => {
    renderAppointmentsForm('creating', mockPatient.uuid);

    expect(screen.getByText(/Appointments Date and Time/i)).toBeInTheDocument();
    // Need to test the banner extension
  });

  it('renders the form with all expected inputs in create mode', () => {
    renderAppointmentsForm('creating', mockPatient.uuid);

    const allInputs = screen.queryAllByLabelText(
      (content, element) => element.tagName.toLowerCase() === 'input',
    ) as Array<HTMLInputElement>;
    const allSelects = screen.queryAllByRole('combobox') as Array<HTMLInputElement>;
    const allTabs = screen.queryAllByRole('tab') as Array<HTMLInputElement>;
    let inputAndSelectNamesAndTabValues = [];

    allInputs.forEach((input) => inputAndSelectNamesAndTabValues.push(input?.id));
    allSelects.forEach((select) => inputAndSelectNamesAndTabValues.push(select?.id));
    allTabs.forEach((tab) => inputAndSelectNamesAndTabValues.push(tab?.id));

    expect(screen.queryByLabelText('Reason For Changes')).not.toBeInTheDocument();
    expect(inputAndSelectNamesAndTabValues).toEqual([
      'visitStartDateInput',
      'start-time-picker',
      'end-time-picker',
      'Yes',
      'No',
      '',
      'frequency',
      'location',
      'service',
      'start-time-picker',
      'end-time-picker',
      'appointmentKind',
      'providers',
      'facility',
      'community',
    ]);
  });

  it('renders the form with all expected inputs in edit mode', () => {
    renderAppointmentsForm('editing', mockPatient.uuid);

    expect(screen.getByLabelText('Reason For Changes')).toBeInTheDocument();
  });

  it('renders the expected appointment kinds', () => {
    renderAppointmentsForm('creating', mockPatient.uuid);
    const appointmentKindSelect = screen.getByLabelText('Select an appointment kind');

    expect((screen.getByRole('option', { name: 'Select an appointment kind' }) as HTMLOptionElement).selected).toBe(
      true,
    );
    expect(within(appointmentKindSelect).getAllByRole('option')).toHaveLength(4);
    expect(within(appointmentKindSelect).getAllByRole('option')[1]).toHaveValue('Scheduled');
    expect(within(appointmentKindSelect).getAllByRole('option')[2]).toHaveValue('WalkIn');
    expect(within(appointmentKindSelect).getAllByRole('option')[3]).toHaveValue('Virtual');

    // TODO handle onselect an option
  });
});
