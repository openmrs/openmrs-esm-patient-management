import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import {
  getCoreTranslation,
  showSnackbar,
  useLayoutType,
  useSession,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import type { OpenmrsCohort, CohortType } from '../api/types';
import PatientListFormWorkspace from './patient-list-form.workspace';
import type { PatientListFormWorkspaceProps } from './patient-list-form.workspace';

const mockCreatePatientList = jest.fn();
const mockEditPatientList = jest.fn();
const mockExtractErrorMessagesFromResponse = jest.fn();

jest.mock('../api/patient-list.resource', () => ({
  createPatientList: (...args: unknown[]) => mockCreatePatientList(...args),
  editPatientList: (...args: unknown[]) => mockEditPatientList(...args),
  extractErrorMessagesFromResponse: (...args: unknown[]) => mockExtractErrorMessagesFromResponse(...args),
}));

const mockUseCohortTypes = jest.fn();

jest.mock('../api/hooks', () => ({
  useCohortTypes: () => mockUseCohortTypes(),
}));

const mockUseSession = jest.mocked(useSession);
const mockUseLayoutType = jest.mocked(useLayoutType);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockGetCoreTranslation = jest.mocked(getCoreTranslation);

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
    mockExtractErrorMessagesFromResponse.mockImplementation((err) => err?.error?.message || 'Unknown error');
  });

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
    expect(screen.getByLabelText(/describe the purpose of this list/i)).toHaveValue('A test patient list description');
    expect(screen.getByRole('button', { name: /edit list/i })).toBeInTheDocument();
  });

  it('creates a new patient list successfully', async () => {
    const user = userEvent.setup();
    const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

    render(<PatientListFormWorkspace {...props} />);

    await user.type(screen.getByLabelText(/list name/i), 'My New Patient List');
    await user.type(screen.getByLabelText(/describe the purpose of this list/i), 'A description for testing');
    await user.click(screen.getByRole('button', { name: /create list/i }));

    expect(mockCreatePatientList).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'My New Patient List',
        description: 'A description for testing',
      }),
    );

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
        title: 'Created',
      }),
    );

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockCloseWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true });
  });

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
    await user.click(screen.getByRole('button', { name: /edit list/i }));

    expect(mockEditPatientList).toHaveBeenCalledWith(
      'test-list-uuid',
      expect.objectContaining({
        name: 'Updated List Name',
      }),
    );

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'success',
        title: 'Updated',
      }),
    );

    expect(mockOnSuccess).toHaveBeenCalled();
    expect(mockCloseWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true });
  });

  it('calls closeWorkspace when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

    render(<PatientListFormWorkspace {...props} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  it('shows error snackbar when creation fails', async () => {
    mockCreatePatientList.mockRejectedValueOnce(new Error('Network error'));

    const user = userEvent.setup();
    const props = createMockWorkspace2Props({ onSuccess: mockOnSuccess });

    render(<PatientListFormWorkspace {...props} />);

    await user.type(screen.getByLabelText(/list name/i), 'Test List');
    await user.click(screen.getByRole('button', { name: /create list/i }));

    expect(mockShowSnackbar).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: 'error',
        title: expect.stringMatching(/error creating list/i),
      }),
    );
  });
});
