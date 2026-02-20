import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { changeAppointmentStatus } from '../../patient-appointments/patient-appointments.resource';
import { useMutateAppointments } from '../../form/appointments-form.resource';
import { type Appointment, AppointmentKind, AppointmentStatus } from '../../types';
import { type ConfigObject, configSchema } from '../../config-schema';
import BatchChangeAppointmentStatusesModal from './batch-change-appointment-statuses.modal';

const mockCloseModal = jest.fn();
const mockMutateAppointments = jest.fn();
const mockChangeAppointmentStatus = jest.mocked(changeAppointmentStatus);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseMutateAppointments = jest.mocked(useMutateAppointments);

jest.mock('../../patient-appointments/patient-appointments.resource', () => ({
  changeAppointmentStatus: jest.fn(),
}));

jest.mock('../../form/appointments-form.resource', () => ({
  useMutateAppointments: jest.fn(),
}));

jest.mock('./batch-change-appointment-statuses.resources', () => ({
  getActiveVisitsForPatient: jest.fn(),
}));

const mockAppointment1: Appointment = {
  uuid: 'appointment-1',
  appointmentNumber: '0001',
  patient: {
    identifier: '100GEJ',
    name: 'John Wilson',
    uuid: 'patient-1',
    gender: 'M',
    age: 35,
  },
  service: {
    appointmentServiceId: 1,
    name: 'Outpatient',
    description: null,
    startTime: '',
    endTime: '',
    maxAppointmentsLimit: null,
    durationMins: null,
    location: {
      uuid: 'location-1',
    },
    uuid: 'service-1',
    initialAppointmentStatus: 'Scheduled',
    creatorName: null,
  },
  provider: {
    uuid: 'provider-1',
    person: { uuid: 'person-1', display: 'Dr James Cook' },
  },
  location: { name: 'HIV Clinic', uuid: 'location-1' },
  startDateTime: new Date().toISOString(),
  appointmentKind: AppointmentKind.SCHEDULED,
  status: AppointmentStatus.SCHEDULED,
  comments: 'Some comments',
  additionalInfo: null,
  providers: [{ uuid: 'person-1', display: 'Dr James Cook' }],
  recurring: false,
  voided: false,
  teleconsultationLink: null,
  extensions: {},
  endDateTime: null,
  dateAppointmentScheduled: null,
};

const mockAppointment2: Appointment = {
  ...mockAppointment1,
  uuid: 'appointment-2',
  appointmentNumber: '0002',
  patient: {
    ...mockAppointment1.patient,
    name: 'Jane Doe',
    uuid: 'patient-2',
  },
  status: AppointmentStatus.CHECKEDIN,
};

describe('BatchChangeAppointmentStatusesModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMutateAppointments.mockReturnValue({ mutateAppointments: mockMutateAppointments });
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkOutButton: { enabled: true, customUrl: '' },
    });
  });

  it('renders the modal with appointment list', () => {
    render(
      <BatchChangeAppointmentStatusesModal
        appointments={[mockAppointment1, mockAppointment2]}
        closeModal={mockCloseModal}
      />,
    );

    expect(screen.getByText('Change appointments status')).toBeInTheDocument();
    expect(screen.getByText('Change the status for the following appointments.')).toBeInTheDocument();
    expect(screen.getByText('John Wilson')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('disables submit button when no status is selected', () => {
    render(<BatchChangeAppointmentStatusesModal appointments={[mockAppointment1]} closeModal={mockCloseModal} />);

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    expect(submitButton).toBeDisabled();
  });

  it('successfully changes status of multiple appointments', async () => {
    const user = userEvent.setup();
    mockChangeAppointmentStatus.mockResolvedValue({} as any);

    render(
      <BatchChangeAppointmentStatusesModal
        appointments={[mockAppointment1, mockAppointment2]}
        closeModal={mockCloseModal}
      />,
    );

    // Select status
    const dropdown = screen.getByRole('combobox');
    await user.click(dropdown);
    const cancelledOption = screen.getByText('Cancelled');
    await user.click(cancelledOption);

    // Click submit
    const submitButton = screen.getByRole('button', { name: /save and close/i });
    await user.click(submitButton);

    expect(mockChangeAppointmentStatus).toHaveBeenCalledWith('Cancelled', 'appointment-1');
    expect(mockChangeAppointmentStatus).toHaveBeenCalledWith('Cancelled', 'appointment-2');
    expect(mockMutateAppointments).toHaveBeenCalled();
    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Appointments updated',
      subtitle: 'Appointments for selected patients have been successfully updated',
    });
  });

  it('shows warning notification when Completed status is selected', async () => {
    const user = userEvent.setup();

    render(<BatchChangeAppointmentStatusesModal appointments={[mockAppointment1]} closeModal={mockCloseModal} />);

    const dropdown = screen.getByRole('combobox');
    await user.click(dropdown);
    const completedOption = screen.getByText('Completed');
    await user.click(completedOption);

    expect(
      screen.getByText('Marking appointment as completed will end the active visit of the patient'),
    ).toBeInTheDocument();
  });

  it('shows warning and disables submit when invalid transition is selected', async () => {
    const user = userEvent.setup();
    const completedAppointment = { ...mockAppointment1, status: AppointmentStatus.COMPLETED };

    render(<BatchChangeAppointmentStatusesModal appointments={[completedAppointment]} closeModal={mockCloseModal} />);

    const dropdown = screen.getByRole('combobox');
    await user.click(dropdown);
    const missedOption = screen.getByText('Missed');
    await user.click(missedOption);

    expect(
      screen.getByText(/Cannot transition appointment with status Completed to status Missed/i),
    ).toBeInTheDocument();

    const submitButton = screen.getByRole('button', { name: /save and close/i });
    expect(submitButton).toBeDisabled();
  });
});
