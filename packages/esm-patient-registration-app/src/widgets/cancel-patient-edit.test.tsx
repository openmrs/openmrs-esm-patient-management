import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';
import CancelPatientEdit from './cancel-patient-edit.modal';

/**
 * Helper to render CancelPatientEdit modal.
 */
function renderCancelPatientEditModal(close = jest.fn(), onConfirm = jest.fn()) {
  return render(<CancelPatientEdit close={close} onConfirm={onConfirm} />);
}

describe('CancelPatientEdit modal', () => {
  const mockClose = jest.fn();
  const mockOnConfirm = jest.fn();

  describe('Rendering', () => {
    it('renders modal with title and message', () => {
      renderCancelPatientEditModal(mockClose, mockOnConfirm);

      expect(screen.getByText(/are you sure you want to discard these changes\?/i)).toBeInTheDocument();
      expect(
        screen.getByText(/your unsaved changes will be lost if you proceed to discard the form/i),
      ).toBeInTheDocument();
    });

    it('renders Cancel and Discard buttons', () => {
      renderCancelPatientEditModal(mockClose, mockOnConfirm);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /discard/i })).toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('calls close when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderCancelPatientEditModal(mockClose, mockOnConfirm);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm when Discard button is clicked', async () => {
      const user = userEvent.setup();
      renderCancelPatientEditModal(mockClose, mockOnConfirm);

      const discardButton = screen.getByRole('button', { name: /discard/i });
      await user.click(discardButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockClose).not.toHaveBeenCalled();
    });
  });
});
