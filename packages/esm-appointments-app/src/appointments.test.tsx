import React from 'react';
import { render, screen } from '@testing-library/react';
import Appointments from './appointments.component';

// TODO: Tweak the ExtensionSlot stub in the framework to not return a function. Functions are not valid React children.
describe('Appointments', () => {
  it('renders the appointments dashboard', async () => {
    render(<Appointments />);

    await screen.findByText(/^appointments$/i);

    expect(screen.getByRole('button', { name: /appointments calendar/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/dd-mmm-yyyy/i)).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', {
        name: /select service type/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: /view/i })).toBeInTheDocument();
    expect(screen.getByText(/appointment metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/scheduled appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/highest volume service/i)).toBeInTheDocument();
    expect(screen.getByText(/providers booked/i)).toBeInTheDocument();
  });
});
