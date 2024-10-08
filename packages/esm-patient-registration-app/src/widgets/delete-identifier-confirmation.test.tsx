import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import DeleteIdentifierConfirmationModal from './delete-identifier-confirmation.modal';

describe('DeleteIdentifierConfirmationModal', () => {
  const mockDeleteIdentifier = jest.fn();
  const mockIdentifierName = 'Identifier Name';
  const mockIdentifierValue = 'Identifier Value';

  it('renders the modal and triggers deleteIdentifier function', async () => {
    const user = userEvent.setup();

    render(
      <DeleteIdentifierConfirmationModal
        closeModal={jest.fn()}
        deleteIdentifier={mockDeleteIdentifier}
        identifierName={mockIdentifierName}
        identifierValue={mockIdentifierValue}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    expect(mockDeleteIdentifier).toHaveBeenCalledWith(false);

    const removeButton = screen.getByRole('button', { name: /remove identifier/i });
    await user.click(removeButton);
    expect(mockDeleteIdentifier).toHaveBeenCalledWith(true);
  });
});
