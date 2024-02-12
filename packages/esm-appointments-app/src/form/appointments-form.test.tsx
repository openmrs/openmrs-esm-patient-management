import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockLocations } from '__mocks__';
import { openmrsFetch } from '@openmrs/esm-framework';
import { mockUseAppointmentServiceData, mockSession } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { saveAppointment } from './appointments-form.resource';
import AppointmentForm from './appointments-form.component';

const testProps = {
  closeWorkspace: jest.fn(),
  patientUuid: mockPatient.id,
  promptBeforeClosing: jest.fn(),
};

const mockCreateAppointment = saveAppointment as jest.Mock;
const mockOpenmrsFetch = openmrsFetch as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useLocations: jest.fn().mockImplementation(() => mockLocations.data.results),
    useSession: jest.fn().mockImplementation(() => mockSession.data),
    useConfig: jest.fn(() => ({
      appointmentTypes: ['Scheduled', 'WalkIn'],
    })),
  };
});

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useForm: jest.fn().mockImplementation(() => ({
    handleSubmit: () => jest.fn(),
    control: {
      register: jest.fn(),
      unregister: jest.fn(),
      getFieldState: jest.fn(),
      _names: {
        array: new Set('test'),
        mount: new Set('test'),
        unMount: new Set('test'),
        watch: new Set('test'),
        focus: 'test',
        watchAll: false,
      },
      _subjects: {
        watch: jest.fn(),
        array: jest.fn(),
        state: jest.fn(),
      },
      _getWatch: jest.fn(),
      _formValues: [],
      _defaultValues: [],
    },
    getValues: (str) => {
      if (str === 'recurringPatternDaysOfWeek') {
        return [];
      } else {
        return null;
      }
    },
    setValue: () => jest.fn(),
    formState: () => jest.fn(),
    watch: () => jest.fn(),
  })),
  Controller: ({ render }) =>
    render({
      field: {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: '',
        ref: jest.fn(),
      },
      formState: {
        isSubmitted: false,
      },
      fieldState: {
        isTouched: false,
      },
    }),
  useSubscribe: () => ({
    r: { current: { subject: { subscribe: () => jest.fn() } } },
  }),
}));

jest.mock('./appointments-form.resource', () => {
  const originalModule = jest.requireActual('./appointments-form.resource');

  return {
    ...originalModule,
    saveAppointment: jest.fn(),
  };
});

describe('AppointmentForm', () => {
  it('renders the appointments form showing all the relevant fields and values', async () => {
    mockOpenmrsFetch.mockReturnValue(mockUseAppointmentServiceData);

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    expect(screen.getByLabelText(/Select a location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select a service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select the type of appointment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Write an additional note/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write any additional points here/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/dd\/mm\/yyyy/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Mosoriot/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /AM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /PM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Choose appointment type/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Scheduled/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /WalkIn/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Date/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save and close/i })).toBeInTheDocument();
  });

  it('closes the form and the workspace when the cancel button is clicked', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValueOnce(mockUseAppointmentServiceData);

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    const cancelButton = screen.getByRole('button', { name: /Discard/i });
    await user.click(cancelButton);

    expect(testProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('renders a success snackbar  upon successfully scheduling an appointment', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockReturnValue({ data: mockUseAppointmentServiceData });
    mockCreateAppointment.mockResolvedValue({ status: 200, statusText: 'Ok' });

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    const dateInput = screen.getByRole('textbox', { name: /Date/i });
    const timeInput = screen.getByRole('textbox', { name: /Time/i });
    const timeFormat = screen.getByRole('combobox', { name: /Time/i });
    const serviceSelect = screen.getByRole('combobox', { name: /Select a service/i });
    const appointmentTypeSelect = screen.getByRole('combobox', { name: /Select the type of appointment/i });

    expect(saveButton).not.toBeDisabled();

    await user.clear(dateInput);
    await user.type(dateInput, '4/4/2021');
    await user.clear(timeInput);
    await user.type(timeInput, '09:30');
    await user.selectOptions(timeFormat, 'AM');
    await user.selectOptions(serviceSelect, ['Outpatient']);
    await user.selectOptions(appointmentTypeSelect, ['Scheduled']);

    await user.click(saveButton);
  });

  it('renders an error snackbar if there was a problem scheduling an appointment', async () => {
    const user = userEvent.setup();

    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockOpenmrsFetch.mockReturnValueOnce({ data: mockUseAppointmentServiceData });
    mockCreateAppointment.mockRejectedValueOnce(error);

    renderAppointmentsForm();

    await waitForLoadingToFinish();

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    const dateInput = screen.getByRole('textbox', { name: /Date/i });
    const timeInput = screen.getByRole('textbox', { name: /Time/i });
    const timeFormat = screen.getByRole('combobox', { name: /Time/i });
    const serviceSelect = screen.getByRole('combobox', { name: /Select a service/i });
    const appointmentTypeSelect = screen.getByRole('combobox', { name: /Select the type of appointment/i });

    await user.clear(dateInput);
    await user.type(dateInput, '4/4/2021');
    await user.clear(timeInput);
    await user.type(timeInput, '09:30');
    await user.selectOptions(timeFormat, 'AM');
    await user.selectOptions(serviceSelect, ['Outpatient']);
    await user.selectOptions(appointmentTypeSelect, ['Scheduled']);
    await user.click(saveButton);
  });
});

function renderAppointmentsForm() {
  renderWithSwr(<AppointmentForm {...testProps} />);
}
