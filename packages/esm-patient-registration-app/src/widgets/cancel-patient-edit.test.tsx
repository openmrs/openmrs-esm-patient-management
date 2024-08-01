import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import CancelPatientEdit from './cancel-patient-edit.component';

describe('CancelPatientEdit component', () => {
  const mockClose = jest.fn();
  const mockOnConfirm = jest.fn();

  it('renders the modal and triggers close and onConfirm functions', async () => {
    const user = userEvent.setup();

    render(<CancelPatientEdit close={mockClose} onConfirm={mockOnConfirm} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);
    expect(mockClose).toHaveBeenCalledTimes(1);

    const discardButton = screen.getByRole('button', { name: /discard/i });
    await user.click(discardButton);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});
