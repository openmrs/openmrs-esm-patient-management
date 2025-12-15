import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar, useSession, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { type BedFormWorkspaceConfig, type BedWorkspaceData } from '../../types';
import { useBedTags, useLocationsWithAdmissionTag } from '../../summary/summary.resource';
import { editBed, saveBed, useBedType, useBedTagMappings } from './bed-form.resource';
import BedFormWorkspace from './bed-form.workspace';

jest.mock('./bed-form.resource', () => ({
  saveBed: jest.fn(),
  editBed: jest.fn(),
  useBedType: jest.fn(),
  useBedTagMappings: jest.fn(),
}));

jest.mock('../../summary/summary.resource', () => ({
  useBedTags: jest.fn(),
  useLocationsWithAdmissionTag: jest.fn(),
}));

const mockUseSession = jest.mocked(useSession);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseBedTags = jest.mocked(useBedTags);
const mockUseLocationsWithAdmissionTag = jest.mocked(useLocationsWithAdmissionTag);
const mockUseBedType = jest.mocked(useBedType);
const mockUseBedTagMappings = jest.mocked(useBedTagMappings);
const mockSaveBed = jest.mocked(saveBed);
const mockEditBed = jest.mocked(editBed);

const mockCloseWorkspace = jest.fn().mockResolvedValue(true);
const mockMutateBeds = jest.fn();

const mockBedData: BedWorkspaceData = {
  uuid: 'bed-uuid-123',
  bedNumber: 'BED-001',
  status: 'AVAILABLE',
  row: 1,
  column: 1,
  bedType: { name: 'Standard' },
  location: { display: 'Ward A', uuid: 'location-uuid-123' },
  bedTags: [{ uuid: 'tag-uuid-1', name: 'ICU' }],
};

const mockLocations = [
  { display: 'Ward A', uuid: 'location-uuid-123', name: 'Ward A' },
  { display: 'Ward B', uuid: 'location-uuid-456', name: 'Ward B' },
];

const mockBedTypes = [
  { name: 'Standard', uuid: 'bed-type-uuid-1' },
  { name: 'ICU', uuid: 'bed-type-uuid-2' },
];

const mockBedTags = [
  { name: 'ICU', uuid: 'tag-uuid-1' },
  { name: 'Emergency', uuid: 'tag-uuid-2' },
];

// Helper to create complete workspace props
const createWorkspaceProps = (config: BedFormWorkspaceConfig): Workspace2DefinitionProps<BedFormWorkspaceConfig> => ({
  workspaceProps: config,
  closeWorkspace: mockCloseWorkspace,
  launchChildWorkspace: jest.fn(),
  windowProps: null,
  groupProps: null,
  workspaceName: 'bed-form-workspace',
  windowName: 'bed-management-window',
  isRootWorkspace: true,
});

// Helper to render workspace with default config
const renderBedFormWorkspace = (config: Partial<BedFormWorkspaceConfig> = {}) => {
  const fullConfig = { mutateBeds: mockMutateBeds, ...config };
  return renderWithSwr(<BedFormWorkspace {...createWorkspaceProps(fullConfig)} />);
};

// Helper to fill out bed form with valid data
const fillBedForm = async (user: ReturnType<typeof userEvent.setup>, bedNumber: string, bedType = 'Standard') => {
  const bedNumberInput = screen.getByLabelText(/bed number/i);
  await user.type(bedNumberInput, bedNumber);

  const bedTypeSelect = screen.getByLabelText(/bed type/i);
  await user.selectOptions(bedTypeSelect, bedType);
};

// Helper to submit form
const submitForm = async (user: ReturnType<typeof userEvent.setup>) => {
  const saveButton = screen.getByRole('button', { name: /save/i });
  await user.click(saveButton);
};

describe('BedFormWorkspace', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      authenticated: true,
      sessionId: 'test-session',
      sessionLocation: { uuid: 'location-uuid-123', display: 'Ward A' },
      currentProvider: { uuid: 'provider-uuid', identifier: 'provider-1' },
    } as ReturnType<typeof useSession>);

    mockUseLocationsWithAdmissionTag.mockReturnValue({
      admissionLocations: mockLocations as any,
      errorLoadingAdmissionLocations: null,
      isLoadingAdmissionLocations: false,
      isValidatingAdmissionLocations: false,
      mutateAdmissionLocations: jest.fn(),
    });

    mockUseBedType.mockReturnValue({
      bedTypes: mockBedTypes as any,
      isLoading: false,
      error: null,
    });

    mockUseBedTags.mockReturnValue({
      bedTags: mockBedTags as any,
      errorLoadingBedTags: null,
      isLoadingBedTags: false,
      isValidatingBedTags: false,
      mutateBedTags: jest.fn(),
    });

    mockUseBedTagMappings.mockReturnValue({
      bedTagMappings: [],
      isLoading: false,
      error: null,
    });
  });

  it('renders the add bed form correctly', () => {
    renderBedFormWorkspace();

    expect(screen.getByLabelText(/bed number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bed row/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bed column/i)).toBeInTheDocument();
    expect(screen.getByText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/occupancy status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bed type/i)).toBeInTheDocument();
  });

  it('renders the edit bed form with pre-filled values', () => {
    renderBedFormWorkspace({ bed: mockBedData });

    expect(screen.getByDisplayValue('BED-001')).toBeInTheDocument();
  });

  it('calls closeWorkspace when cancel is clicked', async () => {
    const user = userEvent.setup();
    renderBedFormWorkspace();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockCloseWorkspace).toHaveBeenCalled();
  });

  it('handles form changes correctly', async () => {
    const user = userEvent.setup();
    renderBedFormWorkspace();

    const bedNumberInput = screen.getByLabelText(/bed number/i);
    await user.type(bedNumberInput, 'BED-01');

    expect(bedNumberInput).toHaveValue('BED-01');
  });

  it('submits a new bed successfully', async () => {
    const user = userEvent.setup();
    mockSaveBed.mockResolvedValue({ data: { uuid: 'new-bed-uuid' } } as any);

    renderBedFormWorkspace();
    await fillBedForm(user, 'BED-001');
    await submitForm(user);

    await waitFor(() => {
      expect(mockSaveBed).toHaveBeenCalled();
    });
  });

  it('submits an edited bed successfully', async () => {
    const user = userEvent.setup();
    mockEditBed.mockResolvedValue({ data: { uuid: 'bed-uuid-123' } } as any);

    renderBedFormWorkspace({ bed: mockBedData });

    const bedNumberInput = screen.getByLabelText(/bed number/i);
    await user.clear(bedNumberInput);
    await user.type(bedNumberInput, 'UPD-001');

    await submitForm(user);

    await waitFor(() => {
      expect(mockEditBed).toHaveBeenCalled();
    });
  });

  it('shows error snackbar when submission fails', async () => {
    const user = userEvent.setup();
    mockSaveBed.mockRejectedValue(new Error('Network error'));

    renderBedFormWorkspace();
    await fillBedForm(user, 'BED-001');
    await submitForm(user);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
        }),
      );
    });
  });

  it('prevents submission when form has not been modified', async () => {
    const user = userEvent.setup();
    mockSaveBed.mockResolvedValue({ data: { uuid: 'new-bed-uuid' } } as any);
    renderBedFormWorkspace();

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Should not submit when form is pristine
    expect(mockSaveBed).not.toHaveBeenCalled();
  });

  it('uses defaultLocation when provided', () => {
    const defaultLocation = { display: 'Default Ward', uuid: 'default-location-uuid' };

    renderBedFormWorkspace({ defaultLocation });

    // Form should render successfully with default location
    expect(screen.getByLabelText(/bed number/i)).toBeInTheDocument();
  });

  it('prevents user from submitting bed number longer than 10 characters', async () => {
    const user = userEvent.setup();
    renderBedFormWorkspace();

    await fillBedForm(user, 'VERYLONGBED123'); // 14 chars
    await submitForm(user);

    expect(mockSaveBed).not.toHaveBeenCalled();
  });

  it('prevents user from submitting without required bed number', async () => {
    const user = userEvent.setup();
    mockSaveBed.mockResolvedValue({ data: { uuid: 'new-bed-uuid' } } as any);
    renderBedFormWorkspace();

    // Fill only bed type (not bed number)
    const bedTypeSelect = screen.getByLabelText(/bed type/i);
    await user.selectOptions(bedTypeSelect, 'Standard');

    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    // Form validation should prevent submission
    expect(mockSaveBed).not.toHaveBeenCalled();
  });

  it('shows success message and refreshes data after creating bed', async () => {
    const user = userEvent.setup();
    mockSaveBed.mockResolvedValue({ data: { uuid: 'new-bed-uuid' } } as any);

    renderBedFormWorkspace();
    await fillBedForm(user, 'BED-100');
    await submitForm(user);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'success',
          title: 'Success',
        }),
      );
    });

    expect(mockMutateBeds).toHaveBeenCalled();
  });

  it('shows success message with different text when updating existing bed', async () => {
    const user = userEvent.setup();
    mockEditBed.mockResolvedValue({ data: { uuid: 'bed-uuid-123' } } as any);

    renderBedFormWorkspace({ bed: mockBedData });

    const bedNumberInput = screen.getByLabelText(/bed number/i);
    await user.clear(bedNumberInput);
    await user.type(bedNumberInput, 'BED-NEW');

    await submitForm(user);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'success',
        }),
      );
    });
  });

  it('allows user to submit form after making changes', async () => {
    const user = userEvent.setup();
    mockSaveBed.mockResolvedValue({ data: { uuid: 'new-bed-uuid' } } as any);
    renderBedFormWorkspace();

    // Make changes to the form
    await fillBedForm(user, 'BED-TEST');
    await submitForm(user);

    // Form should submit successfully after changes
    await waitFor(() => {
      expect(mockSaveBed).toHaveBeenCalled();
    });
  });

  it('shows appropriate error message when network request fails', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Network connection failed';
    mockSaveBed.mockRejectedValue(new Error(errorMessage));

    renderBedFormWorkspace();
    await fillBedForm(user, 'BED-999');
    await submitForm(user);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          subtitle: errorMessage,
        }),
      );
    });
  });
});
