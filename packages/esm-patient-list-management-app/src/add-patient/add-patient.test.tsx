import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { navigate } from '@openmrs/esm-framework';
import { useAddablePatientLists } from '../api/api-remote';
import { mockPatient } from '__mocks__';
import AddPatient from './add-patient.component';

const mockNavigate = jest.mocked(navigate);
const mockUseAddablePatientLists = jest.mocked(useAddablePatientLists);
const mockCloseModal = jest.fn();

jest.mock('../api/api-remote', () => ({
  useAddablePatientLists: jest.fn(),
}));

describe('AddPatient', () => {
  beforeEach(() => {
    mockUseAddablePatientLists.mockReturnValue({
      data: [
        { id: 'list1', displayName: 'List 1', addPatient: jest.fn() },
        { id: 'list2', displayName: 'List 2', addPatient: jest.fn() },
      ],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
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
    expect(screen.getByRole('button', { name: /add to list/i })).toBeInTheDocument();
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

  it('clicking the "Create new list" button opens the create list form', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    const createNewListButton = screen.getByRole('button', { name: /create new patient list/i });
    await user.click(createNewListButton);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: window.getOpenmrsSpaBase() + 'home/patient-lists?new_cohort=true',
    });
  });

  it('clicking the "Cancel" button closes the modal', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });
});
