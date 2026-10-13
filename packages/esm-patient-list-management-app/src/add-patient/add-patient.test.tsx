import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { launchWorkspace2, showModal, showSnackbar } from '@openmrs/esm-framework';
import { useAddablePatientLists } from '../api/patient-list.resource';
import { mockPatient } from '__mocks__';
import AddPatient from './add-patient.modal';

const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);
const mockShowModal = vi.mocked(showModal);
const mockUseAddablePatientLists = vi.mocked(useAddablePatientLists);
const mockCloseModal = vi.fn();
const mockShowSnackbar = vi.mocked(showSnackbar);

vi.mock('../api/patient-list.resource', () => ({
  useAddablePatientLists: vi.fn(),
}));

describe('AddPatientModal', () => {
  beforeEach(() => {
    mockLaunchWorkspace2.mockClear();
    mockShowModal.mockClear();
    mockUseAddablePatientLists.mockReturnValue({
      data: [
        { id: 'list1', displayName: 'List 1', addPatient: vi.fn() },
        { id: 'list2', displayName: 'List 2', addPatient: vi.fn() },
      ],
      isLoading: false,
      error: null,
      mutate: vi.fn(),
      isValidating: false,
    });
  });

  it('renders the Add Patient to List modal', () => {
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    expect(screen.getByRole('heading', { name: /add patient to list/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /search for a list to add this patient to/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /search for a list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear search input/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create new patient list/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /list 1/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /list 2/i })).toBeInTheDocument();
  });

  it('allows selecting and deselecting patient lists', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    const checkbox1 = screen.getByLabelText('List 1');
    const checkbox2 = screen.getByLabelText('List 2');

    await user.click(checkbox1);
    expect(checkbox1).toBeChecked();

    await user.click(checkbox2);
    expect(checkbox2).toBeChecked();

    await user.click(checkbox1);
    expect(checkbox1).not.toBeChecked();
  });

  it('filters patient lists based on search input', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    const searchInput = screen.getByRole('searchbox', { name: /search for a list/i });
    await user.type(searchInput, 'Bananarama');
    expect(screen.getByText(/no matching lists found/i)).toBeInTheDocument();
    expect(screen.getByText(/try searching for a different list/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /create new patient list/i })).toHaveLength(2);

    await user.clear(searchInput);
    await user.type(searchInput, 'List 1');

    expect(screen.getByText('List 1')).toBeInTheDocument();
    expect(screen.queryByText('List 2')).not.toBeInTheDocument();
  });

  it('clicking the "Create new list" button closes the modal and opens the create list form', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    await user.click(screen.getByRole('button', { name: /create new patient list/i }));

    expect(mockCloseModal).toHaveBeenCalled();
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      'patient-list-form-chart-workspace',
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
    // No window/group props: keeps the chart's open workspace group (and any unsaved drafts) untouched
    expect(mockLaunchWorkspace2.mock.calls[0]).toHaveLength(2);
  });

  it('reopens the modal with the new list preselected after the list is created', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    await user.click(screen.getByRole('button', { name: /create new patient list/i }));

    const { onSuccess } = mockLaunchWorkspace2.mock.calls[0][1] as {
      onSuccess: (createdListUuid?: string) => Promise<void>;
    };
    await onSuccess('list2');

    await waitFor(() =>
      expect(mockShowModal).toHaveBeenCalledWith(
        'add-patient-to-patient-list-modal',
        expect.objectContaining({ patientUuid: mockPatient.uuid, preselectedListIds: ['list2'] }),
      ),
    );
  });

  it('checks the preselected list when one is provided', () => {
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} preselectedListIds={['list2']} />);

    expect(screen.getByLabelText('List 2')).toBeChecked();
    expect(screen.getByLabelText('List 1')).not.toBeChecked();
  });

  it('clicking the "Cancel" button closes the modal', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });

    it('keeps previously checked lists when reopening after a list is created', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    await user.click(screen.getByLabelText('List 1'));
    await user.click(screen.getByRole('button', { name: /create new patient list/i }));

    const { onSuccess } = mockLaunchWorkspace2.mock.calls[0][1] as {
      onSuccess: (createdListUuid?: string) => Promise<void>;
    };
    await onSuccess('list3');

    await waitFor(() =>
      expect(mockShowModal).toHaveBeenCalledWith(
        'add-patient-to-patient-list-modal',
        expect.objectContaining({ preselectedListIds: ['list1', 'list3'] }),
      ),
    );
  });

  it('restores the selection modal when the create form cannot be opened', async () => {
    mockLaunchWorkspace2.mockResolvedValueOnce(false as never);

    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    await user.click(screen.getByLabelText('List 1'));
    await user.click(screen.getByRole('button', { name: /create new patient list/i }));

    await waitFor(() =>
      expect(mockShowModal).toHaveBeenCalledWith(
        'add-patient-to-patient-list-modal',
        expect.objectContaining({ preselectedListIds: ['list1'] }),
      ),
    );
  });

  it('shows an error instead of silently skipping a selected list that is not loaded', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} preselectedListIds={['missing']} />);

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    expect(mockCloseModal).not.toHaveBeenCalled();
  });
});
