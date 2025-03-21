import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import DeleteIdentifierConfirmationModal from './delete-identifier-confirmation.modal';

describe('DeleteIdentifierConfirmationModal', () => {
  const mockDeleteIdentifier = jest.fn();
  const closeModal = jest.fn();
  const mockIdentifierName = 'Identifier Name';
  const mockIdentifierValue = 'Identifier Value';

  it('renders the modal and triggers deleteIdentifier function', async () => {
    const user = userEvent.setup();

    render(
      <DeleteIdentifierConfirmationModal
        closeModal={closeModal}
        deleteIdentifier={mockDeleteIdentifier}
        identifierName={mockIdentifierName}
        identifierValue={mockIdentifierValue}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(closeModal).toHaveBeenCalledTimes(1);

    const removeButton = screen.getByRole('button', { name: /remove identifier/i });
    await user.click(removeButton);
    expect(mockDeleteIdentifier).toHaveBeenCalledWith(true);
  });
});
