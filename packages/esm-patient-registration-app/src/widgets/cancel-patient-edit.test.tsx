import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CancelPatientEdit from './cancel-patient-edit.component';

describe('CancelPatientEdit component', () => {
  const mockClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal and triggers close and onConfirm functions', () => {
    const { getByRole } = render(<CancelPatientEdit close={mockClose} onConfirm={mockOnConfirm} />);

    const cancelButton = getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    expect(mockClose).toHaveBeenCalledTimes(1);

    const discardButton = getByRole('button', { name: /discard/i });
    fireEvent.click(discardButton);
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });
});
