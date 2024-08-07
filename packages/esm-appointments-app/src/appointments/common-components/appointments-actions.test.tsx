import React from 'react';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { useTodaysVisits } from '../../hooks/useTodaysVisits';
import { type ConfigObject, configSchema } from '../../config-schema';
import { type Appointment, AppointmentKind, AppointmentStatus } from '../../types';
import AppointmentActions from './appointments-actions.component';

const appointment: Appointment = {
  uuid: '7cd38a6d-377e-491b-8284-b04cf8b8c6d8',
  appointmentNumber: '0000',
  patient: {
    identifier: '100GEJ',
    identifiers: [],
    name: 'John Wilson',
    uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e',
    gender: 'M',
    age: '35',
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
      uuid: '8d6c993e-c2cc-11de-8d13-0010c6dffd0f',
    },
    uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
    initialAppointmentStatus: 'Scheduled',
    creatorName: null,
  },
  provider: {
    uuid: 'f9badd80-ab76-11e2-9e96-0800200c9a66',
    person: { uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' },
  },
  location: { name: 'HIV Clinic', uuid: '2131aff8-2e2a-480a-b7ab-4ac53250262b' },
  startDateTime: new Date().toISOString(),
  appointmentKind: AppointmentKind.WALKIN,
  status: null,
  comments: 'Some comments',
  additionalInfo: null,
  providers: [{ uuid: '24252571-dd5a-11e6-9d9c-0242ac150002', display: 'Dr James Cook' }],
  recurring: false,
  voided: false,
  teleconsultationLink: null,
  extensions: [],
  endDateTime: null,
  dateAppointmentScheduled: null,
};

const defaultProps = {
  visits: [],
  appointment: appointment,
  scheduleType: 'Pending',
  mutate: () => {},
};

const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseTodaysVisits = jest.mocked(useTodaysVisits);

jest.mock('../../hooks/useTodaysVisits', () => ({
  ...jest.requireActual('../../hooks/useTodaysVisits'),
  useTodaysVisits: jest.fn(),
}));

describe('AppointmentActions', () => {
  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders the check in button when appointment is today and the patient has not checked in and check in button enabled', () => {
    appointment.status = AppointmentStatus.SCHEDULED;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, showIfActiveVisit: false, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    mockUseTodaysVisits.mockReturnValue({
      visits: [],
      error: null,
      isLoading: false,
      mutateVisit: jest.fn(),
    });

    const props = { ...defaultProps };
    render(<AppointmentActions {...props} />);

    expect(screen.getByText(/check in/i)).toBeInTheDocument();
  });

  it('does not render the check in button when appointment is today and the patient has not checked in but the check-in button is disabled', () => {
    appointment.status = AppointmentStatus.SCHEDULED;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: false, showIfActiveVisit: false, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    mockUseTodaysVisits.mockReturnValue({
      visits: [],
      error: null,
      isLoading: false,
      mutateVisit: jest.fn(),
    });

    const props = { ...defaultProps };
    render(<AppointmentActions {...props} />);

    expect(screen.queryByText(/check in/i)).not.toBeInTheDocument();
  });

  it('renders the checked out button when the patient has checked out', () => {
    appointment.status = AppointmentStatus.COMPLETED;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, showIfActiveVisit: false, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    mockUseTodaysVisits.mockReturnValue({
      visits: [
        {
          patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
          startDatetime: new Date().toISOString(),
          stopDatetime: new Date().toISOString(),
          uuid: '',
          encounters: [],
          visitType: {
            uuid: '',
            display: 'Facility Visit',
          },
        },
      ],
      error: null,
      isLoading: false,
      mutateVisit: jest.fn(),
    });

    const props = { ...defaultProps };
    render(<AppointmentActions {...props} />);

    expect(screen.getByText('Checked out')).toBeInTheDocument();
  });

  it('renders the check out button when the patient has an active visit and today is the appointment date and the check out button enabled', () => {
    appointment.status = AppointmentStatus.CHECKEDIN;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, showIfActiveVisit: false, customUrl: '' },
      checkOutButton: { enabled: true, customUrl: '' },
    });

    mockUseTodaysVisits.mockReturnValue({
      visits: [
        {
          patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
          startDatetime: new Date().toISOString(),
          stopDatetime: null,
          uuid: '',
          encounters: [],
          visitType: {
            uuid: '',
            display: 'Facility Visit',
          },
        },
      ],
      error: null,
      isLoading: false,
      mutateVisit: jest.fn(),
    });

    const props = { ...defaultProps, scheduleType: 'Scheduled' };
    render(<AppointmentActions {...props} />);

    expect(screen.getByText(/check out/i)).toBeInTheDocument();
  });

  it('does not render check out button when the patient has an active visit and today is the appointment date but the check out button is disabled', () => {
    appointment.status = AppointmentStatus.CHECKEDIN;

    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      checkInButton: { enabled: true, showIfActiveVisit: false, customUrl: '' },
      checkOutButton: { enabled: false, customUrl: '' },
    });

    mockUseTodaysVisits.mockReturnValue({
      visits: [
        {
          patient: { uuid: '8673ee4f-e2ab-4077-ba55-4980f408773e' },
          startDatetime: new Date().toISOString(),
          stopDatetime: null,
          uuid: '',
          encounters: [],
          visitType: {
            uuid: '',
            display: 'Facility Visit',
          },
        },
      ],
      error: null,
      isLoading: false,
      mutateVisit: jest.fn(),
    });

    const props = { ...defaultProps, scheduleType: 'Scheduled' };
    render(<AppointmentActions {...props} />);

    expect(screen.queryByText(/check out/i)).not.toBeInTheDocument();
  });

  // commenting these tests out as this functionality is not implemented yet so not sure how they would have ever passed?
  /*it('renders the correct button when today is the appointment date and the schedule type is pending', () => {
    mockUseConfig.mockReturnValue({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    mockUseTodaysVisits.mockReturnValue({
      visits: [],
    }));
    const props = { ...defaultProps, scheduleType: 'Pending' };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: /Checked out/i });
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when today is the appointment date and the schedule type is not pending', () => {
    mockUseConfig.mockReturnValue({
      checkInButton: { enabled: true },
      checkOutButton: { enabled: true },
    }));
    mockUseTodaysVisits.mockReturnValue({
      visits: [],
    }));
    const props = { ...defaultProps, scheduleType: 'Confirmed' };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: /Checked out/i });
    expect(button).toBeInTheDocument();
  });*/
});
