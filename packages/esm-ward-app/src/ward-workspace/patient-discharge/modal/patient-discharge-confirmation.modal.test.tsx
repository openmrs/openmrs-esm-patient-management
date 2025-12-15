import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientDischargeConfirmationModal from './patient-discharge-confirmation.modal';

describe('PatientDischargeConfirmationModal', () => {
  const mockCloseModal = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    closeModal: mockCloseModal,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct title and message', () => {
    render(<PatientDischargeConfirmationModal {...defaultProps} />);

    expect(screen.getByText(/discharge patient/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to discharge this patient/i)).toBeInTheDocument();
  });

  it('renders cancel and discharge buttons', () => {
    render(<PatientDischargeConfirmationModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discharge/i })).toBeInTheDocument();
  });

  it('calls closeModal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientDischargeConfirmationModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm and closeModal when discharge button is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientDischargeConfirmationModal {...defaultProps} />);

    const dischargeButton = screen.getByRole('button', { name: /discharge/i });
    await user.click(dischargeButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockCloseModal).toHaveBeenCalledTimes(1);
  });
});
