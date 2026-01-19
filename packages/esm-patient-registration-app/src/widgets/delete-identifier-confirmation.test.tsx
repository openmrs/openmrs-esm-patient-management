import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import DeleteIdentifierConfirmationModal from './delete-identifier-confirmation.modal';

/**
 * Helper to render DeleteIdentifierConfirmationModal.
 */
function renderDeleteIdentifierModal(
  closeModal = jest.fn(),
  deleteIdentifier = jest.fn(),
  identifierName = 'Identifier Name',
  identifierValue = 'Identifier Value',
) {
  return render(
    <DeleteIdentifierConfirmationModal
      closeModal={closeModal}
      deleteIdentifier={deleteIdentifier}
      identifierName={identifierName}
      identifierValue={identifierValue}
    />,
  );
}

describe('DeleteIdentifierConfirmationModal', () => {
  const mockDeleteIdentifier = jest.fn();
  const mockCloseModal = jest.fn();
  const mockIdentifierName = 'OpenMRS ID';
  const mockIdentifierValue = '10001V';

  describe('Rendering', () => {
    it('renders modal with title', () => {
      renderDeleteIdentifierModal(mockCloseModal, mockDeleteIdentifier, mockIdentifierName, mockIdentifierValue);

      expect(screen.getByText(/delete identifier\?/i)).toBeInTheDocument();
    });

    it('displays identifier name and value in the message', () => {
      renderDeleteIdentifierModal(mockCloseModal, mockDeleteIdentifier, mockIdentifierName, mockIdentifierValue);

      expect(screen.getByText(mockIdentifierName, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(mockIdentifierValue, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to delete this identifier\?/i)).toBeInTheDocument();
    });

    it('renders Cancel and Remove identifier buttons', () => {
      renderDeleteIdentifierModal(mockCloseModal, mockDeleteIdentifier, mockIdentifierName, mockIdentifierValue);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove identifier/i })).toBeInTheDocument();
    });

    it('handles missing identifier name and value gracefully', () => {
      renderDeleteIdentifierModal(mockCloseModal, mockDeleteIdentifier, '', '');

      expect(screen.getByText(/are you sure you want to delete this identifier\?/i)).toBeInTheDocument();
    });
  });

  describe('User interaction', () => {
    it('calls closeModal when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      renderDeleteIdentifierModal(mockCloseModal, mockDeleteIdentifier, mockIdentifierName, mockIdentifierValue);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockCloseModal).toHaveBeenCalledTimes(1);
      expect(mockDeleteIdentifier).not.toHaveBeenCalled();
    });

    it('calls deleteIdentifier with true when Remove identifier button is clicked', async () => {
      const user = userEvent.setup();
      renderDeleteIdentifierModal(mockCloseModal, mockDeleteIdentifier, mockIdentifierName, mockIdentifierValue);

      const removeButton = screen.getByRole('button', { name: /remove identifier/i });
      await user.click(removeButton);

      expect(mockDeleteIdentifier).toHaveBeenCalledWith(true);
      expect(mockDeleteIdentifier).toHaveBeenCalledTimes(1);
      expect(mockCloseModal).not.toHaveBeenCalled();
    });
  });
});
