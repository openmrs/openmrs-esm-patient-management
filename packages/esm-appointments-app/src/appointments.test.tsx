import React from 'react';
import { render, screen } from '@testing-library/react';
import ClinicalAppointments from './appointments.component';

describe('Clinical Appointments', () => {
  it('should render correctly', () => {
    render(<ClinicalAppointments />);

    expect(screen.getByTitle(/patient queue illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/^appointments$/i)).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/DD-MMM-YYYY/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /appointments calendar/i })).toBeInTheDocument();
  });
});
