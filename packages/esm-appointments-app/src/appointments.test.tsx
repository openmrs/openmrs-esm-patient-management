import React from 'react';
import { render, screen } from '@testing-library/react';
import ClinicalAppointments from './appointments.component';

describe('ClinicalAppointments Component', () => {
  it('renders AppointmentsCalendarListView when pathname includes "calendar"', () => {
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/some-path/calendar',
      },
      writable: true,
    });

    render(<ClinicalAppointments />);

    expect(screen.getByTestId('appointments-calendar')).toBeInTheDocument();
  });

  it('renders CalendarPatientList when pathname includes "list"', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/some-path/list',
      },
      writable: true,
    });

    render(<ClinicalAppointments />);

    expect(screen.getByTestId('calendar-patient-list')).toBeInTheDocument();
  });

  it('renders other components when pathname does not include "calendar" or "list"', () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/some-path/some-other-path',
      },
      writable: true,
    });

    render(<ClinicalAppointments />);

    expect(screen.getByTestId('appointments-header')).toBeInTheDocument();
    expect(screen.getByTestId('clinic-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('appointment-list')).toBeInTheDocument();
  });
});
