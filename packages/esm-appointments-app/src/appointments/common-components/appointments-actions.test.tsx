import { render, screen } from '@testing-library/react';
import React from 'react';
import AppointmentActions from './appointments-actions.component';
import { type MappedAppointment } from '../../types';

describe('AppointmentActions', () => {
  const defaultProps = {
    visits: [],
    appointment: {
      patientUuid: '123',
      dateTime: new Date().toISOString(),
    } as MappedAppointment,
    scheduleType: 'Pending',
  };

  beforeAll(() => {
    jest.useFakeTimers('modern');
    const currentDateTime = new Date();
    currentDateTime.setHours(12);
    currentDateTime.setMinutes(0);

    jest.setSystemTime(currentDateTime);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders the correct button when the patient has checked out', () => {
    const visits = [
      {
        patient: { uuid: '123' },
        startDatetime: new Date().toISOString(),
        stopDatetime: new Date().toISOString(),
      },
    ];
    const props = { ...defaultProps, visits };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Checked out');
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when the patient has an active visit and today is the appointment date', () => {
    const visits = [
      {
        patient: { uuid: '123' },
        startDatetime: new Date().toISOString(),
        stopDatetime: null,
      },
    ];
    const props = { ...defaultProps, visits, scheduleType: 'Scheduled' };
    const { getByText } = render(<AppointmentActions {...props} />);
    const button = getByText('Check out');
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when today is the appointment date and the schedule type is pending', () => {
    const props = { ...defaultProps, scheduleType: 'Pending' };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: 'Actions' });
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when today is the appointment date and the schedule type is not pending', () => {
    const props = { ...defaultProps, scheduleType: 'Confirmed' };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: 'Actions' });
    expect(button).toBeInTheDocument();
  });

  it('renders the correct button when the appointment is in the past or has not been scheduled', () => {
    const props = { ...defaultProps, appointment: { ...defaultProps.appointment, dateTime: '2022-01-01' } };
    render(<AppointmentActions {...props} />);
    const button = screen.getByRole('button', { name: 'Follow up' });
    expect(button).toBeInTheDocument();
  });
});
