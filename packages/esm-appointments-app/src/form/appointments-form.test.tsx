import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  openmrsFetch,
  showSnackbar,
  useConfig,
  useLocations,
  useSession,
} from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { mockUseAppointmentServiceData, mockSession, mockLocations, mockProviders } from '__mocks__';
import { mockPatient, renderWithSwr, waitForLoadingToFinish } from 'tools';
import { saveAppointment } from './appointments-form.resource';
import { useProviders } from '../hooks/useProviders';
import AppointmentForm from './appointments-form.component';

const defaultProps = {
  context: 'creating',
  closeWorkspace: jest.fn(),
  patientUuid: mockPatient.id,
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
};

const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockSaveAppointment = jest.mocked(saveAppointment);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseLocations = jest.mocked(useLocations);
const mockUseProviders = jest.mocked(useProviders);
const mockUseSession = jest.mocked(useSession);

jest.mock('./appointments-form.resource', () => ({
  ...jest.requireActual('./appointments-form.resource'),
  saveAppointment: jest.fn(),
}));

jest.mock('../hooks/useProviders', () => ({
  ...jest.requireActual('../hooks/useProviders'),
  useProviders: jest.fn(),
}));

jest.mock('../workload/workload.resource', () => ({
  ...jest.requireActual('../workload/workload.resource'),
  getMonthlyCalendarDistribution: jest.fn(),
  useAppointmentSummary: jest.fn(),
  useCalendarDistribution: jest.fn(),
  useMonthlyCalendarDistribution: jest.fn().mockReturnValue([]),
  useMonthlyAppointmentSummary: jest.fn().mockReturnValue([]),
}));

describe('AppointmentForm', () => {
  const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3}Z|\+00:00)$/;

  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      appointmentTypes: ['Scheduled', 'WalkIn'],
    });
    mockUseLocations.mockReturnValue(mockLocations.data.results);
    mockUseSession.mockReturnValue(mockSession.data);
    mockUseProviders.mockReturnValue({
      providers: mockProviders.data,
      isLoading: false,
      error: null,
      isValidating: false,
    });
  });

  it('renders the appointments form', async () => {
    mockOpenmrsFetch.mockResolvedValue(mockUseAppointmentServiceData as unknown as FetchResponse);

    renderWithSwr(<AppointmentForm {...defaultProps} />);

    await waitForLoadingToFinish();

    expect(screen.getByLabelText(/select a location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select a service/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select the type of appointment/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/write an additional note/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write any additional points here/i)).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/dd\/mm\/yyyy/i).length).toBe(2);
    expect(screen.getByRole('option', { name: /mosoriot/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /inpatient ward/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^date$/i)).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^am$/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /^pm$/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /choose appointment type/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /scheduled/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /walkin/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /^date$/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /time/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save and close/i })).toBeInTheDocument();
  });

  it('closes the workspace when the cancel button is clicked', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValueOnce(mockUseAppointmentServiceData as unknown as FetchResponse);

    renderWithSwr(<AppointmentForm {...defaultProps} />);

    await waitForLoadingToFinish();

    const cancelButton = screen.getByRole('button', { name: /Discard/i });
    await user.click(cancelButton);

    expect(defaultProps.closeWorkspace).toHaveBeenCalledTimes(1);
  });

  it('renders a success snackbar upon successfully scheduling an appointment', async () => {
    const user = userEvent.setup();

    mockOpenmrsFetch.mockResolvedValue({ data: mockUseAppointmentServiceData } as unknown as FetchResponse);
    mockSaveAppointment.mockResolvedValue({ status: 200, statusText: 'Ok' } as FetchResponse);

    renderWithSwr(<AppointmentForm {...defaultProps} />);

    await waitForLoadingToFinish();

    const locationSelect = screen.getByRole('combobox', { name: /select a location/i });
    const serviceSelect = screen.getByRole('combobox', { name: /select a service/i });
    const appointmentTypeSelect = screen.getByRole('combobox', { name: /select the type of appointment/i });
    const providerSelect = screen.getByRole('combobox', { name: /select a provider/i });
    const dateInput = screen.getByRole('textbox', { name: /^date$/i });
    const timeInput = screen.getByRole('textbox', { name: /time/i });
    const timeFormat = screen.getByRole('combobox', { name: /time/i });
    const saveButton = screen.getByRole('button', { name: /save and close/i });

    await user.selectOptions(locationSelect, ['Inpatient Ward']);
    await user.selectOptions(serviceSelect, ['Outpatient']);
    await user.selectOptions(appointmentTypeSelect, ['Scheduled']);
    await user.selectOptions(providerSelect, ['doctor - James Cook']);

    const date = '4/4/2021';
    const time = '09:30';

    await user.type(dateInput, date);
    await user.type(timeInput, time);
    await user.tab();
    await user.selectOptions(timeFormat, 'AM');
    await user.click(saveButton);

    expect(mockSaveAppointment).toHaveBeenCalledTimes(1);
    expect(mockSaveAppointment).toHaveBeenCalledWith(
      {
        appointmentKind: 'Scheduled',
        comments: '',
        dateAppointmentScheduled: expect.stringMatching(dateTimeRegex),
        endDateTime: expect.stringMatching(dateTimeRegex),
        locationUuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        patientUuid: mockPatient.id,
        providers: [{ uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66' }],
        serviceUuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
        startDateTime: expect.stringMatching(dateTimeRegex),
        status: '',
        uuid: undefined,
      },
      new AbortController(),
    );

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      isLowContrast: true,
      subtitle: 'It is now visible on the Appointments page',
      title: 'Appointment scheduled',
    });
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

    mockOpenmrsFetch.mockResolvedValue({ data: mockUseAppointmentServiceData } as unknown as FetchResponse);
    mockSaveAppointment.mockRejectedValue(error);

    renderWithSwr(<AppointmentForm {...defaultProps} />);

    await waitForLoadingToFinish();

    const locationSelect = screen.getByRole('combobox', { name: /select a location/i });
    const serviceSelect = screen.getByRole('combobox', { name: /select a service/i });
    const appointmentTypeSelect = screen.getByRole('combobox', { name: /select the type of appointment/i });
    const providerSelect = screen.getByRole('combobox', { name: /select a provider/i });
    const dateInput = screen.getByRole('textbox', { name: /^date$/i });
    const timeInput = screen.getByRole('textbox', { name: /time/i });
    const timeFormat = screen.getByRole('combobox', { name: /time/i });
    const saveButton = screen.getByRole('button', { name: /save and close/i });

    await user.selectOptions(locationSelect, ['Inpatient Ward']);
    await user.selectOptions(serviceSelect, ['Outpatient']);
    await user.selectOptions(appointmentTypeSelect, ['Scheduled']);
    await user.selectOptions(providerSelect, ['doctor - James Cook']);

    const date = '4/4/2021';
    const time = '09:30';

    await user.type(dateInput, date);
    await user.type(timeInput, time);
    await user.tab();
    await user.selectOptions(timeFormat, 'AM');
    await user.click(saveButton);

    expect(mockSaveAppointment).toHaveBeenCalledTimes(1);
    expect(mockSaveAppointment).toHaveBeenCalledWith(
      {
        appointmentKind: 'Scheduled',
        comments: '',
        dateAppointmentScheduled: expect.stringMatching(dateTimeRegex),
        endDateTime: expect.stringMatching(dateTimeRegex),
        locationUuid: 'b1a8b05e-3542-4037-bbd3-998ee9c40574',
        patientUuid: mockPatient.id,
        providers: [{ uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66' }],
        serviceUuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
        startDateTime: expect.stringMatching(dateTimeRegex),
        status: '',
        uuid: undefined,
      },
      new AbortController(),
    );

    expect(mockShowSnackbar).toHaveBeenCalledTimes(1);
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      isLowContrast: false,
      kind: 'error',
      subtitle: 'Internal Server Error',
      title: 'Error scheduling appointment',
    });
  });
});
