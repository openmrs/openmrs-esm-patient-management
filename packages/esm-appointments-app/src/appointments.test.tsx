import React from 'react';
import { render, screen } from '@testing-library/react';
import Appointments from './appointments.component';

describe('Appointments', () => {
  it('should render correctly', () => {
    render(<Appointments />);

    expect(screen.getByTitle(/patient queue illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/^appointments$/i)).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/DD-MMM-YYYY/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /appointments calendar/i })).toBeInTheDocument();
  });
});
