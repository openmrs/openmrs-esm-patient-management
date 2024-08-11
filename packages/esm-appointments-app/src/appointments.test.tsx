import React from 'react';
import { render, screen } from '@testing-library/react';
import Appointments from './appointments.component';

describe('Appointments', () => {
  it('renders the appointments dashboard', async () => {
    render(<Appointments />);

    await screen.findByText(/^appointments$/i);
    expect(screen.getByRole('button', { name: /appointments calendar/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/dd-mmm-yyyy/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /view/i })).toBeInTheDocument();
    expect(screen.getByText(/appointment metrics/i)).toBeInTheDocument();
  });
});
