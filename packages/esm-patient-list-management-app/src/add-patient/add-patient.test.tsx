import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { navigate, useConfig, showSnackbar } from '@openmrs/esm-framework';
import { useAddablePatientLists, getPatientLocationFromIdentifiers } from '../api/patient-list.resource';
import { mockPatient } from '__mocks__';
import AddPatient from './add-patient.modal';

jest.mock('@openmrs/esm-framework', () => ({
  navigate: jest.fn(),
  useConfig: jest.fn(),
  showSnackbar: jest.fn(),
  usePagination: jest.fn((items, pageSize) => ({
    results: items,
    goTo: jest.fn(),
    currentPage: 1,
    paginated: false,
  })),
  getCoreTranslation: jest.fn((key) => key),
  restBaseUrl: '/openmrs/ws/rest/v1',
}));

jest.mock('../api/patient-list.resource', () => ({
  useAddablePatientLists: jest.fn(),
  getPatientLocationFromIdentifiers: jest.fn(),
}));

const mockNavigate = jest.mocked(navigate);
const mockUseAddablePatientLists = jest.mocked(useAddablePatientLists);
const mockUseConfig = jest.mocked(useConfig);
const mockGetPatientLocationFromIdentifiers = jest.mocked(getPatientLocationFromIdentifiers);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockCloseModal = jest.fn();

describe('AddPatientModal', () => {
  beforeEach(() => {
    mockUseAddablePatientLists.mockReturnValue({
      data: [
        {
          id: 'list1',
          displayName: 'List 1',
          addPatient: jest.fn(),
          location: { uuid: 'loc-1', display: 'Location 1' },
        },
        {
          id: 'list2',
          displayName: 'List 2',
          addPatient: jest.fn(),
          location: { uuid: 'loc-2', display: 'Location 2' },
        },
        { id: 'list3', displayName: 'List 3', addPatient: jest.fn(), location: null },
      ],
      isLoading: false,
      error: null,
      mutate: jest.fn(),
      isValidating: false,
    });
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: false,
    });
    mockGetPatientLocationFromIdentifiers.mockResolvedValue(null);
    mockShowSnackbar.mockImplementation(() => {});
    jest.clearAllMocks();
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

  it('clicking the "Create new list" button opens the create list form', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    const createNewListButton = screen.getByRole('button', { name: /create new patient list/i });
    await user.click(createNewListButton);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: window.getOpenmrsSpaBase() + 'home/patient-lists?create=true',
    });
  });

  it('clicking the "Cancel" button closes the modal', async () => {
    const user = userEvent.setup();
    render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockCloseModal).toHaveBeenCalled();
  });

  describe('Location match enforcement', () => {
    it('fetches patient location when enforcePatientListLocationMatch is enabled', async () => {
      mockUseConfig.mockReturnValue({
        enforcePatientListLocationMatch: true,
      });
      mockGetPatientLocationFromIdentifiers.mockResolvedValue({ uuid: 'loc-1', display: 'Location 1' });

      render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

      await waitFor(() => {
        expect(mockGetPatientLocationFromIdentifiers).toHaveBeenCalledWith(mockPatient.uuid);
      });
    });

    it('blocks adding patient when location mismatch is detected', async () => {
      const user = userEvent.setup();
      const addPatientMock = jest.fn().mockResolvedValue({});

      mockUseConfig.mockReturnValue({
        enforcePatientListLocationMatch: true,
      });
      mockGetPatientLocationFromIdentifiers.mockResolvedValue({ uuid: 'patient-loc', display: 'Patient Location' });
      mockUseAddablePatientLists.mockReturnValue({
        data: [
          {
            id: 'list1',
            displayName: 'List 1',
            addPatient: addPatientMock,
            location: { uuid: 'different-loc', display: 'Different Location' },
          },
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

      await waitFor(() => {
        expect(mockGetPatientLocationFromIdentifiers).toHaveBeenCalled();
      });

      const checkbox = screen.getByRole('checkbox', { name: /list 1/i });
      await user.click(checkbox);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Error',
            kind: 'error',
            subtitle: expect.stringContaining('Patient location does not match list location'),
          }),
        );
      });
      expect(addPatientMock).not.toHaveBeenCalled();
    });

    it('allows adding patient when location matches', async () => {
      const user = userEvent.setup();
      const addPatientMock = jest.fn().mockResolvedValue({});

      mockUseConfig.mockReturnValue({
        enforcePatientListLocationMatch: true,
      });
      mockGetPatientLocationFromIdentifiers.mockResolvedValue({ uuid: 'loc-1', display: 'Location 1' });
      mockUseAddablePatientLists.mockReturnValue({
        data: [
          {
            id: 'list1',
            displayName: 'List 1',
            addPatient: addPatientMock,
            location: { uuid: 'loc-1', display: 'Location 1' },
          },
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

      await waitFor(() => {
        expect(mockGetPatientLocationFromIdentifiers).toHaveBeenCalled();
      });

      const checkbox = screen.getByRole('checkbox', { name: /list 1/i });
      await user.click(checkbox);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Successfully added',
            kind: 'success',
          }),
        );
      });
      expect(addPatientMock).toHaveBeenCalled();
    });

    it('allows adding patient when enforcePatientListLocationMatch is disabled even with location mismatch', async () => {
      const user = userEvent.setup();
      const addPatientMock = jest.fn().mockResolvedValue({});

      mockUseConfig.mockReturnValue({
        enforcePatientListLocationMatch: false,
      });
      mockGetPatientLocationFromIdentifiers.mockResolvedValue({ uuid: 'loc-A', display: 'Location A' });
      mockUseAddablePatientLists.mockReturnValue({
        data: [
          {
            id: 'list1',
            displayName: 'List 1',
            addPatient: addPatientMock,
            location: { uuid: 'loc-B', display: 'Location B' },
          },
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

      const checkbox = screen.getByRole('checkbox', { name: /list 1/i });
      await user.click(checkbox);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            kind: 'success',
          }),
        );
      });
      expect(addPatientMock).toHaveBeenCalled();
    });

    it('allows adding patient when list has no location even with enforcePatientListLocationMatch enabled', async () => {
      const user = userEvent.setup();
      const addPatientMock = jest.fn().mockResolvedValue({});

      mockUseConfig.mockReturnValue({
        enforcePatientListLocationMatch: true,
      });
      mockGetPatientLocationFromIdentifiers.mockResolvedValue({ uuid: 'patient-loc', display: 'Patient Location' });
      mockUseAddablePatientLists.mockReturnValue({
        data: [
          {
            id: 'list1',
            displayName: 'List 1',
            addPatient: addPatientMock,
            location: null,
          },
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

      await waitFor(() => {
        expect(mockGetPatientLocationFromIdentifiers).toHaveBeenCalled();
      });

      const checkbox = screen.getByRole('checkbox', { name: /list 1/i });
      await user.click(checkbox);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            kind: 'success',
          }),
        );
      });
      expect(addPatientMock).toHaveBeenCalled();
    });

    it('allows adding to multiple lists with correct location matches', async () => {
      const user = userEvent.setup();
      const addPatientMock1 = jest.fn().mockResolvedValue({});
      const addPatientMock2 = jest.fn().mockResolvedValue({});

      mockUseConfig.mockReturnValue({
        enforcePatientListLocationMatch: true,
      });
      mockGetPatientLocationFromIdentifiers.mockResolvedValue({ uuid: 'loc-1', display: 'Location 1' });
      mockUseAddablePatientLists.mockReturnValue({
        data: [
          {
            id: 'list1',
            displayName: 'List 1',
            addPatient: addPatientMock1,
            location: { uuid: 'loc-1', display: 'Location 1' },
          },
          {
            id: 'list2',
            displayName: 'List 2',
            addPatient: addPatientMock2,
            location: { uuid: 'loc-1', display: 'Location 1' },
          },
        ],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<AddPatient closeModal={mockCloseModal} patientUuid={mockPatient.uuid} />);

      await waitFor(() => {
        expect(mockGetPatientLocationFromIdentifiers).toHaveBeenCalled();
      });

      const checkbox1 = screen.getByRole('checkbox', { name: /list 1/i });
      const checkbox2 = screen.getByRole('checkbox', { name: /list 2/i });
      await user.click(checkbox1);
      await user.click(checkbox2);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(addPatientMock1).toHaveBeenCalled();
      });
      expect(addPatientMock2).toHaveBeenCalled();
    });
  });
});
