import React from 'react';
import { render, screen } from '@testing-library/react';
import ClinicalAppointments from './appointments.component';

describe('ClinicalAppointments Component', () => {
  it('should render correctly', () => {
    render(<ClinicalAppointments />);

    expect(screen.getByTestId('appointments-header')).toBeInTheDocument();
    expect(screen.getByTestId('clinic-metrics')).toBeInTheDocument();
    expect(screen.getByTestId('appointment-list')).toBeInTheDocument();
  });
});
