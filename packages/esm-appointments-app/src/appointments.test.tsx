import React from 'react';
import { render, screen } from '@testing-library/react';
import Appointments from './appointments.component';

// TODO: Tweak the ExtensionSlot stub in the framework to not return a function. Functions are not valid React children.
describe('Appointments', () => {
  it('renders the appointments dashboard', async () => {
    render(<Appointments />);

    await screen.findByRole('combobox');

    expect(screen.getByRole('button', { name: /appointments calendar/i })).toBeInTheDocument();
    expect(screen.getByText(/filter appointments by service type/i)).toBeInTheDocument();
    expect(screen.getByText(/appointments calendar/i)).toBeInTheDocument();
  });
});
