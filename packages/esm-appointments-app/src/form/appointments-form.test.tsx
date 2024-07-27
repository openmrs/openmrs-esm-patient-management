import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  openmrsFetch,
  useConfig,
  useLocations,
  useSession,
} from '@openmrs/esm-framework';
import { mockUseAppointmentServiceData, mockSession, mockLocations } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { saveAppointment } from './appointments-form.resource';
import { configSchema, type ConfigObject } from '../config-schema';
import AppointmentForm from './appointments-form.component';

const defaultProps = {
  context: 'creating',
  closeWorkspace: jest.fn(),
  patientUuid: mockPatient.id,
  promptBeforeClosing: jest.fn(),
};

const mockCreateAppointment = jest.mocked(saveAppointment);
const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseLocations = jest.mocked(useLocations);
const mockUseSession = jest.mocked(useSession);

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  useLocations: jest.fn(),
}));

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
  useController: () => ({
    field: { ref: jest.fn() },
  }),
}));

jest.mock('./appointments-form.resource', () => ({
  ...jest.requireActual('./appointments-form.resource'),
  saveAppointment: jest.fn(),
}));

describe('AppointmentForm', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      appointmentTypes: ['Scheduled', 'WalkIn'],
    });
    mockUseLocations.mockReturnValue(mockLocations.data.results);
    mockUseSession.mockReturnValue(mockSession.data);
  });

  it('renders the appointments form showing all the relevant fields and values', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockUseAppointmentServiceData as unknown as FetchResponse);

    renderWithSwr(<AppointmentForm {...defaultProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByLabelText(/Select a location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Date$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select a service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Select the type of appointment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Write an additional note/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Write any additional points here/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/dd\/mm\/yyyy/i).length).toBe(2);
    expect(screen.getByRole('option', { name: /Mosoriot/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Inpatient Ward/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /AM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /PM/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Choose appointment type/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Scheduled/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /WalkIn/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^Date$/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Time/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save and close/i })).toBeInTheDocument();
  });

  it('closes the form and the workspace when the cancel button is clicked', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValueOnce(mockUseAppointmentServiceData as unknown as FetchResponse);

    renderWithSwr(<AppointmentForm {...defaultProps} />);

    await waitForLoadingToFinish();

    const cancelButton = screen.getByRole('button', { name: /Discard/i });
    await user.click(cancelButton);

    expect(defaultProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('renders a success snackbar  upon successfully scheduling an appointment', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValue({ data: mockUseAppointmentServiceData } as unknown as FetchResponse);
    mockCreateAppointment.mockResolvedValue({ status: 200, statusText: 'Ok' } as FetchResponse);

    renderWithSwr(<AppointmentForm {...defaultProps} />);

    await waitForLoadingToFinish();

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    const dateInput = screen.getByRole('textbox', { name: /^Date$/i });
    const timeInput = screen.getByRole('textbox', { name: /Time/i });
    const timeFormat = screen.getByRole('combobox', { name: /Time/i });
    const serviceSelect = screen.getByRole('combobox', { name: /Select a service/i });
    const appointmentTypeSelect = screen.getByRole('combobox', { name: /Select the type of appointment/i });

    expect(saveButton).toBeEnabled();

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

    mockOpenmrsFetch.mockResolvedValueOnce({ data: mockUseAppointmentServiceData } as unknown as FetchResponse);
    mockCreateAppointment.mockRejectedValueOnce(error);

    renderWithSwr(<AppointmentForm {...defaultProps} />);

    await waitForLoadingToFinish();

    const saveButton = screen.getByRole('button', { name: /Save and close/i });
    const dateInput = screen.getByRole('textbox', { name: /^Date$/i });
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
