import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import DeleteIdentifierConfirmationModal from './delete-identifier-confirmation-modal';

describe('DeleteIdentifierConfirmationModal component', () => {
  const mockDeleteIdentifier = jest.fn();
  const mockIdentifierName = 'Identifier Name';
  const mockIdentifierValue = 'Identifier Value';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal and triggers deleteIdentifier function', () => {
    render(
      <DeleteIdentifierConfirmationModal
        deleteIdentifier={mockDeleteIdentifier}
        identifierName={mockIdentifierName}
        identifierValue={mockIdentifierValue}
      />,
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockDeleteIdentifier).toHaveBeenCalledWith(false);

    const removeButton = screen.getByRole('button', { name: /remove identifier/i });
    fireEvent.click(removeButton);
    expect(mockDeleteIdentifier).toHaveBeenCalledWith(true);
  });
});
