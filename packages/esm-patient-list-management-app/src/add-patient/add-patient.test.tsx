import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { launchWorkspace2, showModal, showSnackbar, useConfig, navigate } from '@openmrs/esm-framework';
import { useAddablePatientLists, getPatientLocationFromIdentifiers } from '../api/patient-list.resource';
import { mockPatient } from '__mocks__';
import AddPatient from './add-patient.modal';

const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);
const mockShowModal = vi.mocked(showModal);
const mockUseAddablePatientLists = vi.mocked(useAddablePatientLists);
const mockCloseModal = vi.fn();
const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseConfig = vi.mocked(useConfig);
const mockNavigate = vi.mocked(navigate);
const mockGetPatientLocationFromIdentifiers = vi.mocked(getPatientLocationFromIdentifiers);

vi.mock('@openmrs/esm-framework', () => ({
  navigate: vi.fn(),
  useConfig: vi.fn(),
  showSnackbar: vi.fn(),
  launchWorkspace2: vi.fn(),
  showModal: vi.fn(),
  usePagination: vi.fn((items, pageSize) => ({
    results: items,
    goTo: vi.fn(),
    currentPage: 1,
    paginated: false,
  })),
  getCoreTranslation: vi.fn((key) => key),
  restBaseUrl: '/openmrs/ws/rest/v1',
}));

vi.mock('../api/patient-list.resource', () => ({
  useAddablePatientLists: vi.fn(),
  getPatientLocationFromIdentifiers: vi.fn(),
}));

describe('AddPatientModal', () => {
  beforeEach(() => {
    mockLaunchWorkspace2.mockClear();
    mockShowModal.mockClear();
    mockUseAddablePatientLists.mockReturnValue({
      data: [
        {
          id: 'list1',
          displayName: 'List 1',
          addPatient: vi.fn(),
          location: { uuid: 'loc-1', display: 'Location 1' },
        },
        {
          id: 'list2',
          displayName: 'List 2',
          addPatient: vi.fn(),
          location: { uuid: 'loc-2', display: 'Location 2' },
        },
        { id: 'list3', displayName: 'List 3', addPatient: vi.fn(), location: null },
      ],
      isLoading: false,
      error: null,
      mutate: vi.fn(),
      isValidating: false,
    });
    mockUseConfig.mockReturnValue({
      enforcePatientListLocationMatch: false,
    });
    mockGetPatientLocationFromIdentifiers.mockResolvedValue(null);
    mockShowSnackbar.mockImplementation(() => {});
    vi.clearAllMocks();
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
        expect.objectContaining({ preselectedListIds: ['list3', 'list1'] }),
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

  it('shows the newly created list first, followed by the earlier selections', () => {
    mockUseAddablePatientLists.mockReturnValue({
      data: Array.from({ length: 8 }, (_, index) => ({
        id: `list${index + 1}`,
        displayName: `List ${index + 1}`,
        addPatient: vi.fn(),
      })),
      isLoading: false,
      error: null,
      mutate: vi.fn(),
      isValidating: false,
    });

    render(
      <AddPatient
        closeModal={mockCloseModal}
        patientUuid={mockPatient.uuid}
        preselectedListIds={['list8', 'list1', 'list2', 'list3', 'list4', 'list5']}
      />,
    );

    const checkboxIds = screen.getAllByRole('checkbox').map((checkbox) => checkbox.id);
    expect(checkboxIds.slice(0, 5)).toEqual(['list8', 'list1', 'list2', 'list3', 'list4']);
    expect(screen.getByLabelText('List 8')).toBeChecked();
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
      const addPatientMock = vi.fn().mockResolvedValue({});

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
        mutate: vi.fn(),
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
      const addPatientMock = vi.fn().mockResolvedValue({});

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
        mutate: vi.fn(),
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
      const addPatientMock = vi.fn().mockResolvedValue({});

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
        mutate: vi.fn(),
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
      const addPatientMock = vi.fn().mockResolvedValue({});

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
        mutate: vi.fn(),
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
      const addPatientMock1 = vi.fn().mockResolvedValue({});
      const addPatientMock2 = vi.fn().mockResolvedValue({});

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
        mutate: vi.fn(),
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
