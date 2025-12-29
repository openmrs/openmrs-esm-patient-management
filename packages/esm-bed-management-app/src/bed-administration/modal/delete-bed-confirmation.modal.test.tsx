import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar } from '@openmrs/esm-framework';
import { deleteBed } from '../../summary/summary.resource';
import DeleteBed from './delete-bed-confirmation.modal';

jest.mock('../../summary/summary.resource', () => ({
  deleteBed: jest.fn(),
}));

const mockShowSnackbar = jest.mocked(showSnackbar);
const mockDeleteBed = jest.mocked(deleteBed);

const mockCloseModal = jest.fn();
const mockMutateBeds = jest.fn();

const defaultProps = {
  closeModal: mockCloseModal,
  uuid: 'test-bed-uuid-123',
  mutateBeds: mockMutateBeds,
};

describe('DeleteBed', () => {
  it('renders the delete bed confirmation modal correctly', () => {
    render(<DeleteBed {...defaultProps} />);

    expect(screen.getByText(/delete bed/i)).toBeInTheDocument();
    expect(screen.getByText(/are you sure you want to delete this bed\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('closes the modal when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteBed {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockDeleteBed).not.toHaveBeenCalled();
  });

  it('deletes the bed successfully when delete button is clicked', async () => {
    const user = userEvent.setup();
    mockDeleteBed.mockResolvedValue({ ok: true } as any);

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteBed).toHaveBeenCalledWith('test-bed-uuid-123');
    });

    expect(mockMutateBeds).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Bed deleted',
      subtitle: 'Bed deleted successfully',
      kind: 'success',
    });
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('shows error snackbar when deletion fails with translated message', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Cannot delete bed ';
    mockDeleteBed.mockRejectedValue({
      responseBody: {
        error: {
          translatedMessage: errorMessage,
        },
      },
    });

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Failed to delete bed',
        subtitle: errorMessage,
        kind: 'error',
      });
    });

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('shows generic error message when deletion fails without specific error message', async () => {
    const user = userEvent.setup();
    mockDeleteBed.mockRejectedValue({ responseBody: {} });

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Failed to delete bed',
        subtitle: 'Unable to delete bed. Please try again.',
        kind: 'error',
      });
    });

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('shows loading state while deleting', async () => {
    const user = userEvent.setup();
    mockDeleteBed.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    expect(deleteButton).toBeDisabled();
    expect(screen.getByText(/deleting\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockDeleteBed).toHaveBeenCalled();
    });
  });

  it('disables delete button while deletion is in progress', async () => {
    const user = userEvent.setup();
    mockDeleteBed.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeEnabled();

    await user.click(deleteButton);

    expect(deleteButton).toBeDisabled();

    await waitFor(() => {
      expect(mockDeleteBed).toHaveBeenCalled();
    });
  });

  it('calls mutateBeds after successful deletion', async () => {
    const user = userEvent.setup();
    mockDeleteBed.mockResolvedValue({ ok: true } as any);

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockMutateBeds).toHaveBeenCalled();
    });
  });

  it('does not call mutateBeds when deletion fails', async () => {
    const localMutateBeds = jest.fn(); // Fresh mock to ensure zero calls
    const user = userEvent.setup();
    mockDeleteBed.mockRejectedValue(new Error('Network error'));

    render(<DeleteBed {...defaultProps} mutateBeds={localMutateBeds} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
        }),
      );
    });

    expect(localMutateBeds).not.toHaveBeenCalled();
  });

  it('re-enables delete button after failed deletion', async () => {
    const user = userEvent.setup();
    mockDeleteBed.mockRejectedValue(new Error('Failed'));

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalled();
    });

    expect(deleteButton).toBeEnabled();
  });

  it('closes the modal on successful deletion', async () => {
    const user = userEvent.setup();
    mockDeleteBed.mockResolvedValue({ ok: true } as any);

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('closes the modal on failed deletion', async () => {
    const user = userEvent.setup();
    mockDeleteBed.mockRejectedValue(new Error('Failed'));

    render(<DeleteBed {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });
});
