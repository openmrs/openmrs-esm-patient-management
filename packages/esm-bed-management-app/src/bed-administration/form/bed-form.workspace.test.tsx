import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { showSnackbar, useSession } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import BedFormWorkspace from './bed-form.workspace';
import { type BedFormWorkspaceProps, type BedWorkspaceData } from '../../types';
import { useBedTags, useLocationsWithAdmissionTag } from '../../summary/summary.resource';
import { editBed, saveBed, useBedType, useBedTagMappings } from './bed-form.resource';

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    showSnackbar: jest.fn(),
    useSession: jest.fn(),
    useLayoutType: jest.fn(() => 'desktop'),
    getCoreTranslation: jest.fn((key) => key),
  };
});

jest.mock('../../summary/summary.resource', () => ({
  useBedTags: jest.fn(),
  useLocationsWithAdmissionTag: jest.fn(),
}));

jest.mock('./bed-form.resource', () => ({
  saveBed: jest.fn(),
  editBed: jest.fn(),
  useBedType: jest.fn(),
  useBedTagMappings: jest.fn(),
}));

const mockUseSession = jest.mocked(useSession);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseBedTags = jest.mocked(useBedTags);
const mockUseLocationsWithAdmissionTag = jest.mocked(useLocationsWithAdmissionTag);
const mockUseBedType = jest.mocked(useBedType);
const mockUseBedTagMappings = jest.mocked(useBedTagMappings);
const mockSaveBed = jest.mocked(saveBed);
const mockEditBed = jest.mocked(editBed);

const mockWorkspaceProps: Omit<BedFormWorkspaceProps, 'bed' | 'mutateBeds' | 'defaultLocation' | 'workspaceTitle'> = {
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
};

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

describe('BedFormWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();

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
    renderWithSwr(<BedFormWorkspace {...mockWorkspaceProps} mutateBeds={mockMutateBeds} />);

    expect(screen.getByLabelText(/bed number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bed row/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bed column/i)).toBeInTheDocument();
    expect(screen.getByText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/occupancy status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bed type/i)).toBeInTheDocument();
  });

  it('renders the edit bed form with pre-filled values', () => {
    renderWithSwr(<BedFormWorkspace {...mockWorkspaceProps} bed={mockBedData} mutateBeds={mockMutateBeds} />);

    expect(screen.getByDisplayValue('BED-001')).toBeInTheDocument();
  });

  it('calls closeWorkspace when cancel is clicked', async () => {
    const user = userEvent.setup();

    renderWithSwr(<BedFormWorkspace {...mockWorkspaceProps} mutateBeds={mockMutateBeds} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockWorkspaceProps.closeWorkspace).toHaveBeenCalled();
  });

  it('calls promptBeforeClosing with isDirty function', async () => {
    const user = userEvent.setup();

    renderWithSwr(<BedFormWorkspace {...mockWorkspaceProps} mutateBeds={mockMutateBeds} />);

    const bedNumberInput = screen.getByLabelText(/bed number/i);
    await user.type(bedNumberInput, 'BED-01');

    expect(mockWorkspaceProps.promptBeforeClosing).toHaveBeenCalled();
  });

  it('submits a new bed successfully', async () => {
    const user = userEvent.setup();
    mockSaveBed.mockResolvedValue({ data: { uuid: 'new-bed-uuid' } } as any);

    renderWithSwr(<BedFormWorkspace {...mockWorkspaceProps} mutateBeds={mockMutateBeds} />);

    // Fill out the form with a valid bed number (max 10 chars)
    const bedNumberInput = screen.getByLabelText(/bed number/i);
    await user.type(bedNumberInput, 'BED-001');

    // Select bed type
    const bedTypeSelect = screen.getByLabelText(/bed type/i);
    await user.selectOptions(bedTypeSelect, 'Standard');

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSaveBed).toHaveBeenCalled();
    });
  });

  it('submits an edited bed successfully', async () => {
    const user = userEvent.setup();
    mockEditBed.mockResolvedValue({ data: { uuid: 'bed-uuid-123' } } as any);

    renderWithSwr(<BedFormWorkspace {...mockWorkspaceProps} bed={mockBedData} mutateBeds={mockMutateBeds} />);

    // Modify the bed number with a valid value (max 10 chars)
    const bedNumberInput = screen.getByLabelText(/bed number/i);
    await user.clear(bedNumberInput);
    await user.type(bedNumberInput, 'UPD-001');

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockEditBed).toHaveBeenCalled();
    });
  });

  it('shows error snackbar when submission fails', async () => {
    const user = userEvent.setup();
    mockSaveBed.mockRejectedValue(new Error('Network error'));

    renderWithSwr(<BedFormWorkspace {...mockWorkspaceProps} mutateBeds={mockMutateBeds} />);

    // Fill out required fields with valid bed number (max 10 chars)
    const bedNumberInput = screen.getByLabelText(/bed number/i);
    await user.type(bedNumberInput, 'BED-001');

    const bedTypeSelect = screen.getByLabelText(/bed type/i);
    await user.selectOptions(bedTypeSelect, 'Standard');

    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
        }),
      );
    });
  });

  it('disables save button when form is not dirty', () => {
    renderWithSwr(<BedFormWorkspace {...mockWorkspaceProps} mutateBeds={mockMutateBeds} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it('uses defaultLocation when provided', () => {
    const defaultLocation = { display: 'Default Ward', uuid: 'default-location-uuid' };

    renderWithSwr(
      <BedFormWorkspace {...mockWorkspaceProps} mutateBeds={mockMutateBeds} defaultLocation={defaultLocation} />,
    );

    // The form should render without errors
    expect(screen.getByLabelText(/bed number/i)).toBeInTheDocument();
  });
});
