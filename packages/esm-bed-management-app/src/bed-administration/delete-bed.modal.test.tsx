import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { openmrsFetch, restBaseUrl, showSnackbar, type FetchResponse } from '@openmrs/esm-framework';
import { type Bed } from '../types';
import DeleteBedModal from './delete-bed.modal';

const bed: Bed = { id: 1, uuid: 'bed-uuid', bedNumber: 'BED-001', row: 1, column: 1, status: 'AVAILABLE' };
const closeModal = vi.fn();
const mutateBeds = vi.fn();
const mockFetch = vi.mocked(openmrsFetch);

describe('DeleteBedModal', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ status: 204 } as FetchResponse);
  });

  it('requires a non-blank reason and allows cancellation without deleting', async () => {
    const user = userEvent.setup();
    render(<DeleteBedModal bed={bed} closeModal={closeModal} mutateBeds={mutateBeds} />);
    expect(screen.getByText(/Are you sure you want to delete bed/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete$/ })).toBeDisabled();
    await user.type(screen.getByRole('textbox'), '   ');
    expect(screen.getByRole('button', { name: /Delete$/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(closeModal).toHaveBeenCalledOnce();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('deletes the selected bed with an encoded reason and refreshes after success', async () => {
    const user = userEvent.setup();
    render(<DeleteBedModal bed={bed} closeModal={closeModal} mutateBeds={mutateBeds} />);
    await user.type(screen.getByRole('textbox'), '  Duplicate & unused  ');
    await user.click(screen.getByRole('button', { name: /Delete$/ }));
    await waitFor(() => expect(closeModal).toHaveBeenCalledOnce());
    expect(mockFetch).toHaveBeenCalledWith(`${restBaseUrl}/bed/bed-uuid?reason=Duplicate%20%26%20unused`, {
      method: 'DELETE',
    });
    expect(mutateBeds).toHaveBeenCalledOnce();
    expect(showSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'success' }));
  });

  it('keeps the dialog open and permits retry after a server error', async () => {
    mockFetch.mockRejectedValueOnce({ responseBody: { error: { message: 'Bed is now occupied' } } });
    const user = userEvent.setup();
    render(<DeleteBedModal bed={bed} closeModal={closeModal} mutateBeds={mutateBeds} />);
    await user.type(screen.getByRole('textbox'), 'Duplicate');
    await user.click(screen.getByRole('button', { name: /Delete$/ }));
    expect(await screen.findByText('Bed is now occupied')).toBeInTheDocument();
    expect(closeModal).not.toHaveBeenCalled();
    expect(mutateBeds).not.toHaveBeenCalled();
    expect(showSnackbar).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('Duplicate');
    await user.click(screen.getByRole('button', { name: /Delete$/ }));
    await waitFor(() => expect(closeModal).toHaveBeenCalledOnce());
  });

  it('prevents repeated submissions while deletion is pending', async () => {
    let resolveRequest: (response: FetchResponse) => void;
    mockFetch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<DeleteBedModal bed={bed} closeModal={closeModal} mutateBeds={mutateBeds} />);
    await user.type(screen.getByRole('textbox'), 'Duplicate');
    await user.dblClick(screen.getByRole('button', { name: /Delete$/ }));
    expect(mockFetch).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(closeModal).not.toHaveBeenCalled();
    await act(async () => resolveRequest({ status: 204 } as FetchResponse));
    expect(closeModal).toHaveBeenCalledOnce();
  });

  it('prevents deletion when an occupied bed is passed to the dialog', () => {
    render(<DeleteBedModal bed={{ ...bed, status: 'OCCUPIED' }} closeModal={closeModal} mutateBeds={mutateBeds} />);
    expect(screen.getByText('Occupied beds cannot be deleted')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete$/ })).toBeDisabled();
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
