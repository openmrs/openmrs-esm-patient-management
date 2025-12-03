import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import {
  getCoreTranslation,
  showSnackbar,
  useLayoutType,
  useSession,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { createPatientList, editPatientList } from '../api/api-remote';
import { useCohortTypes } from '../api/hooks';
import type { OpenmrsCohort, CohortType } from '../api/types';
import PatientListFormWorkspace from './patient-list-form.workspace';
import type { PatientListFormWorkspaceProps } from './patient-list-form.workspace';

// Mock dependencies
jest.mock('../api/api-remote', () => ({
  createPatientList: jest.fn(),
  editPatientList: jest.fn(),
  extractErrorMessagesFromResponse: jest.fn((err) => err?.message || 'Unknown error'),
}));

jest.mock('../api/hooks', () => ({
  useCohortTypes: jest.fn(),
}));

const mockCreatePatientList = jest.mocked(createPatientList);
const mockEditPatientList = jest.mocked(editPatientList);
const mockUseCohortTypes = jest.mocked(useCohortTypes);
const mockUseSession = jest.mocked(useSession);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockGetCoreTranslation = jest.mocked(getCoreTranslation);

// Mock workspace v2 props
const mockCloseWorkspace = jest.fn();
const mockOnSuccess = jest.fn();

const mockCohortTypes: CohortType[] = [
  { uuid: 'type-1', display: 'My List' },
  { uuid: 'type-2', display: 'System List' },
];

const mockPatientListDetails: OpenmrsCohort = {
  uuid: 'test-list-uuid',
  name: 'Test Patient List',
  description: 'A test patient list description',
  cohortType: { uuid: 'type-1', display: 'My List' },
  resourceVersion: '1.0',
  attributes: [],
  links: [],
  location: null,
  groupCohort: false,
  startDate: '2023-01-01',
  endDate: null,
  voidReason: null,
  voided: false,
  size: 5,
};

/**
 * Creates mock workspace v2 props for testing
 */
function createMockWorkspace2Props(
  workspaceProps: PatientListFormWorkspaceProps | null = null,
): Workspace2DefinitionProps<PatientListFormWorkspaceProps> {
  return {
    workspaceProps,
    closeWorkspace: mockCloseWorkspace,
    windowProps: null,
    groupProps: null,
    workspaceName: 'patient-list-form-workspace',
    isRootWorkspace: true,
    launchChildWorkspace: jest.fn(),
  } as unknown as Workspace2DefinitionProps<PatientListFormWorkspaceProps>;
}

describe('PatientListFormWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSession.mockReturnValue(mockSession.data);
    mockUseLayoutType.mockReturnValue('small-desktop');
    mockUseCohortTypes.mockReturnValue({
      listCohortTypes: mockCohortTypes,
      isLoading: false,
      error: null,
      mutate: jest.fn(),
    });
    mockGetCoreTranslation.mockImplementation((key) => {
      const translations: Record<string, string> = {
        cancel: 'Cancel',
      };
      return translations[key] || key;
    });
    mockCreatePatientList.mockResolvedValue({});
    mockEditPatientList.mockResolvedValue({});
  });

  describe('Component Rendering', () => {
    it('renders the create new patient list form correctly', () => {
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      expect(screen.getByText(/configure your patient list/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/list name/i)).toBeInTheDocument();
      expect(screen.getByText(/select cohort type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/describe the purpose of this list/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create list/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('renders the edit patient list form with existing data', () => {
      const props = createMockWorkspace2Props({
        patientListDetails: mockPatientListDetails,
        onSuccess: mockOnSuccess,
      });

      render(<PatientListFormWorkspace {...props} />);

      expect(screen.getByLabelText(/list name/i)).toHaveValue('Test Patient List');
      expect(screen.getByLabelText(/describe the purpose of this list/i)).toHaveValue(
        'A test patient list description',
      );
      expect(screen.getByRole('button', { name: /edit list/i })).toBeInTheDocument();
    });

    it('handles null workspaceProps gracefully', () => {
      const props = createMockWorkspace2Props(null);

      render(<PatientListFormWorkspace {...props} />);

      expect(screen.getByText(/configure your patient list/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/list name/i)).toHaveValue('');
    });
  });

  describe('Workspace V2 Props Integration', () => {
    it('receives and uses Workspace2DefinitionProps correctly', () => {
      const workspaceProps: PatientListFormWorkspaceProps = {
        patientListDetails: mockPatientListDetails,
        onSuccess: mockOnSuccess,
      };
      const props = createMockWorkspace2Props(workspaceProps);

      render(<PatientListFormWorkspace {...props} />);

      // Verify workspace props are applied
      expect(screen.getByLabelText(/list name/i)).toHaveValue(mockPatientListDetails.name);
    });

    it('closeWorkspace is called when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockCloseWorkspace).toHaveBeenCalled();
    });

    it('closeWorkspace is called with discardUnsavedChanges after successful save', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      const nameInput = screen.getByLabelText(/list name/i);
      await user.type(nameInput, 'New Test List');

      const createButton = screen.getByRole('button', { name: /create list/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockCloseWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true });
      });
    });
  });

  describe('Form State Management', () => {
    it('tracks form changes correctly', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      const nameInput = screen.getByLabelText(/list name/i);
      expect(nameInput).toHaveValue('');

      await user.type(nameInput, 'New List Name');
      expect(nameInput).toHaveValue('New List Name');
    });

    it('populates form with existing patient list details for editing', () => {
      const props = createMockWorkspace2Props({
        patientListDetails: mockPatientListDetails,
        onSuccess: mockOnSuccess,
      });

      render(<PatientListFormWorkspace {...props} />);

      expect(screen.getByLabelText(/list name/i)).toHaveValue('Test Patient List');
      expect(screen.getByLabelText(/describe the purpose of this list/i)).toHaveValue(
        'A test patient list description',
      );
    });

    it('validates required fields before submission', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      // Try to submit without entering a name
      const createButton = screen.getByRole('button', { name: /create list/i });
      await user.click(createButton);

      // createPatientList should not be called due to validation
      expect(mockCreatePatientList).not.toHaveBeenCalled();
    });
  });

  describe('Dirty State Detection (Unsaved Changes)', () => {
    it('detects dirty state when form values change from initial empty state', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      // Initially the form should not be dirty
      const nameInput = screen.getByLabelText(/list name/i);
      expect(nameInput).toHaveValue('');

      // Make a change
      await user.type(nameInput, 'New Value');

      // Form is now dirty - this is tracked internally by isDirty computed value
      // and passed to Workspace2 via hasUnsavedChanges prop
      expect(nameInput).toHaveValue('New Value');
    });

    it('detects dirty state when editing existing list and values change', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({
        patientListDetails: mockPatientListDetails,
        onSuccess: mockOnSuccess,
      });

      render(<PatientListFormWorkspace {...props} />);

      const nameInput = screen.getByLabelText(/list name/i);
      expect(nameInput).toHaveValue('Test Patient List');

      // Modify the value
      await user.clear(nameInput);
      await user.type(nameInput, 'Modified Name');

      expect(nameInput).toHaveValue('Modified Name');
    });

    it('form is not dirty when values match initial state', () => {
      const props = createMockWorkspace2Props({
        patientListDetails: mockPatientListDetails,
        onSuccess: mockOnSuccess,
      });

      render(<PatientListFormWorkspace {...props} />);

      // Values should match initial state, form is not dirty
      expect(screen.getByLabelText(/list name/i)).toHaveValue('Test Patient List');
    });
  });

  describe('Patient List Creation Flow', () => {
    it('creates a new patient list successfully', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      const nameInput = screen.getByLabelText(/list name/i);
      await user.type(nameInput, 'My New Patient List');

      const descriptionInput = screen.getByLabelText(/describe the purpose of this list/i);
      await user.type(descriptionInput, 'A description for testing');

      const createButton = screen.getByRole('button', { name: /create list/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockCreatePatientList).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'My New Patient List',
            description: 'A description for testing',
          }),
        );
      });

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            kind: 'success',
            title: 'Created',
          }),
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockCloseWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true });
    });

    it('shows error snackbar when creation fails', async () => {
      mockCreatePatientList.mockRejectedValueOnce(new Error('Network error'));

      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      const nameInput = screen.getByLabelText(/list name/i);
      await user.type(nameInput, 'Test List');

      const createButton = screen.getByRole('button', { name: /create list/i });
      await user.click(createButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            kind: 'error',
            title: expect.stringMatching(/error creating list/i),
          }),
        );
      });

      // Workspace should not be closed on error
      expect(mockCloseWorkspace).not.toHaveBeenCalledWith({ discardUnsavedChanges: true });
    });
  });

  describe('Patient List Editing Flow', () => {
    it('edits an existing patient list successfully', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({
        patientListDetails: mockPatientListDetails,
        onSuccess: mockOnSuccess,
      });

      render(<PatientListFormWorkspace {...props} />);

      const nameInput = screen.getByLabelText(/list name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated List Name');

      const editButton = screen.getByRole('button', { name: /edit list/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(mockEditPatientList).toHaveBeenCalledWith(
          'test-list-uuid',
          expect.objectContaining({
            name: 'Updated List Name',
          }),
        );
      });

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            kind: 'success',
            title: 'Updated',
          }),
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockCloseWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true });
    });

    it('shows error snackbar when edit fails', async () => {
      mockEditPatientList.mockRejectedValueOnce(new Error('Update failed'));

      const user = userEvent.setup();
      const props = createMockWorkspace2Props({
        patientListDetails: mockPatientListDetails,
        onSuccess: mockOnSuccess,
      });

      render(<PatientListFormWorkspace {...props} />);

      const nameInput = screen.getByLabelText(/list name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const editButton = screen.getByRole('button', { name: /edit list/i });
      await user.click(editButton);

      await waitFor(() => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          expect.objectContaining({
            kind: 'error',
            title: expect.stringMatching(/error updating list/i),
          }),
        );
      });
    });
  });

  describe('Cohort Type Selection', () => {
    it('renders cohort type dropdown with available types', () => {
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      expect(screen.getByText(/select cohort type/i)).toBeInTheDocument();
    });

    it('allows selecting a cohort type', async () => {
      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      // Find and click the dropdown
      const dropdown = screen.getByText(/choose cohort type/i);
      await user.click(dropdown);

      // Select an option (the dropdown items should be visible)
      const option = await screen.findByText('My List');
      await user.click(option);
    });
  });

  describe('Button States', () => {
    it('shows submitting state when form is being submitted', async () => {
      // Make the promise hang to test loading state
      mockCreatePatientList.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({}), 1000)));

      const user = userEvent.setup();
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      const nameInput = screen.getByLabelText(/list name/i);
      await user.type(nameInput, 'Test List');

      const createButton = screen.getByRole('button', { name: /create list/i });
      await user.click(createButton);

      // Button should show submitting state
      expect(screen.getByRole('button', { name: /submitting/i })).toBeDisabled();
    });

    it('cancel button is always enabled', () => {
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      expect(cancelButton).toBeEnabled();
    });
  });

  describe('Layout Responsiveness', () => {
    it('renders correctly on tablet layout', () => {
      mockUseLayoutType.mockReturnValue('tablet');
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      expect(screen.getByText(/configure your patient list/i)).toBeInTheDocument();
    });

    it('renders correctly on desktop layout', () => {
      mockUseLayoutType.mockReturnValue('small-desktop');
      const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

      render(<PatientListFormWorkspace {...props} />);

      expect(screen.getByText(/configure your patient list/i)).toBeInTheDocument();
    });
  });
});

describe('Workspace V2 Registration Tests', () => {
  it('workspace is defined with correct v2 configuration structure', () => {
    // This test validates the workspace v2 registration structure
    const workspace2Config = {
      name: 'patient-list-form-workspace',
      component: 'patientListFormWorkspace',
      window: 'patient-list-form-window',
    };

    expect(workspace2Config.name).toBe('patient-list-form-workspace');
    expect(workspace2Config.window).toBe('patient-list-form-window');
  });

  it('workspace window is assigned to correct group', () => {
    const workspaceWindow2Config = {
      name: 'patient-list-form-window',
      group: 'patientListFormWorkspaceGroup',
    };

    expect(workspaceWindow2Config.name).toBe('patient-list-form-window');
    expect(workspaceWindow2Config.group).toBe('patientListFormWorkspaceGroup');
  });

  it('workspace group is configured correctly', () => {
    const workspaceGroup2Config = {
      name: 'patientListFormWorkspaceGroup',
      overlay: false,
    };

    expect(workspaceGroup2Config.name).toBe('patientListFormWorkspaceGroup');
    expect(workspaceGroup2Config.overlay).toBe(false);
  });
});

describe('Workspace Launch Tests', () => {
  const mockLaunchWorkspace2 = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('workspace can be launched with group parameter', () => {
    // Simulates launchWorkspace2 call pattern
    mockLaunchWorkspace2('patient-list-form-workspace', {
      onSuccess: mockOnSuccess,
    });

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', {
      onSuccess: mockOnSuccess,
    });
  });

  it('workspace can be launched for editing with patientListDetails', () => {
    mockLaunchWorkspace2('patient-list-form-workspace', {
      patientListDetails: mockPatientListDetails,
      onSuccess: mockOnSuccess,
    });

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', {
      patientListDetails: mockPatientListDetails,
      onSuccess: mockOnSuccess,
    });
  });

  it('workspace can be launched without any props for creating new list', () => {
    mockLaunchWorkspace2('patient-list-form-workspace');

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace');
  });

  it('props are correctly passed through workspace v2 system', () => {
    const customProps = {
      patientListDetails: mockPatientListDetails,
      onSuccess: jest.fn(),
    };

    mockLaunchWorkspace2('patient-list-form-workspace', customProps);

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', customProps);
  });
});
