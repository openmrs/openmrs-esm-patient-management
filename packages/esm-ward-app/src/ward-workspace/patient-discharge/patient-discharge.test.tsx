import React from 'react';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { closeWorkspaceGroup2, showSnackbar, useAppContext, type FetchResponse } from '@openmrs/esm-framework';
import { useCreateEncounter, removePatientFromBed } from '../../ward.resource';
import PatientDischargeWorkspace from './patient-discharge.workspace';
import { mockInpatientRequestAlice, mockPatientAlice, mockVisitAlice } from '__mocks__';
import type { WardPatient, WardPatientWorkspaceDefinition, WardViewContext } from '../../types';
import type { EmrApiConfigurationResponse } from '../../hooks/useEmrConfiguration';
import { expect, vi, describe, it, beforeEach } from 'vitest';

const mockShowSnackbar = vi.mocked(showSnackbar);
const mockUseCreateEncounter = vi.mocked(useCreateEncounter);
const mockRemovePatientFromBed = vi.mocked(removePatientFromBed);
const mockUseAppContext = vi.mocked(useAppContext);
const mockCloseWorkspaceGroup2 = vi.mocked(closeWorkspaceGroup2);

vi.mock('../../ward.resource', () => ({
  useCreateEncounter: vi.fn(),
  removePatientFromBed: vi.fn(),
}));

vi.mock('../patient-banner/patient-banner.component', () => ({
  default: () => <div>patient-banner</div>,
}));

function submitDischargeForm() {
  fireEvent.submit(screen.getByRole('form', { name: /discharge/i }));
}

const mockWardPatient: WardPatient = {
  patient: mockPatientAlice,
  visit: mockVisitAlice,
  bed: {
    id: 1,
    uuid: 'bed-1',
    bedNumber: 'Bed 1',
    bedType: {
      uuid: 'bed-type',
      name: 'General',
      displayName: 'General',
      description: '',
      resourceVersion: '',
    },
    row: 1,
    column: 1,
    status: 'OCCUPIED',
  },
  inpatientAdmission: null,
  inpatientRequest: mockInpatientRequestAlice,
};

const testProps: WardPatientWorkspaceDefinition = {
  groupProps: { wardPatient: mockWardPatient },
  closeWorkspace: vi.fn(),
  launchChildWorkspace: vi.fn(),
  showActionMenu: false,
  workspaceProps: null,
  windowProps: null,
  workspaceName: 'discharge',
  windowName: 'discharge',
  isRootWorkspace: false,
};

describe('PatientDischargeWorkspace', () => {
  const mockCreateEncounter = vi.fn();
  const mockWardPatientMutate = vi.fn();

  beforeEach(() => {
    mockUseCreateEncounter.mockReturnValue({
      createEncounter: mockCreateEncounter,
      emrConfiguration: {
        consultFreeTextCommentsConcept: { uuid: 'consult-concept', display: '' },
        exitFromInpatientEncounterType: { uuid: 'exit-encounter', display: '' },
      } as EmrApiConfigurationResponse,
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });

    mockUseAppContext.mockReturnValue({
      wardPatientGroupDetails: { mutate: mockWardPatientMutate },
    } as unknown as WardViewContext);
  });

  it('renders discharge workspace with note field and action buttons', () => {
    render(<PatientDischargeWorkspace {...testProps} />);

    expect(screen.getByText(/Discharge note \(optional\)/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/write any notes here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Confirm discharge/i })).toBeInTheDocument();
  });

  it('calls closeWorkspace when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<PatientDischargeWorkspace {...testProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(testProps.closeWorkspace).toHaveBeenCalled();
  });

  it('submits discharge with note, removes patient from bed, and shows success snackbar', async () => {
    const user = userEvent.setup();

    mockCreateEncounter.mockResolvedValueOnce({ ok: true } as unknown as FetchResponse);
    mockRemovePatientFromBed.mockResolvedValueOnce({ ok: true } as unknown as FetchResponse);

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.clear(noteInput);
    await user.type(noteInput, 'Patient recovered');

    submitDischargeForm();

    await waitFor(() => {
      expect(mockCreateEncounter).toHaveBeenCalledWith(
        mockWardPatient.patient,
        { uuid: 'exit-encounter', display: '' },
        mockWardPatient.visit.uuid,
        [
          {
            concept: 'consult-concept',
            value: 'Patient recovered',
          },
        ],
      );
    });

    // Then verify all other calls happened
    expect(mockRemovePatientFromBed).toHaveBeenCalledWith(mockWardPatient.bed.id, mockWardPatient.patient.uuid);
    expect(mockWardPatientMutate).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Patient was discharged',
      kind: 'success',
    });
    expect(testProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true });
    expect(mockCloseWorkspaceGroup2).toHaveBeenCalled();
  });

  it('submits discharge without note, removes patient from bed, and shows success snackbar', async () => {
    mockCreateEncounter.mockResolvedValueOnce({ ok: true } as unknown as FetchResponse);
    mockRemovePatientFromBed.mockResolvedValueOnce({ ok: true } as unknown as FetchResponse);

    render(<PatientDischargeWorkspace {...testProps} />);

    submitDischargeForm();

    await waitFor(() => {
      expect(mockCreateEncounter).toHaveBeenCalledWith(
        mockWardPatient.patient,
        { uuid: 'exit-encounter', display: '' },
        mockWardPatient.visit.uuid,
        [],
      );
    });

    // Then verify all other calls happened
    expect(mockRemovePatientFromBed).toHaveBeenCalledWith(mockWardPatient.bed.id, mockWardPatient.patient.uuid);
    expect(mockWardPatientMutate).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Patient was discharged',
      kind: 'success',
    });
    expect(testProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true });
    expect(mockCloseWorkspaceGroup2).toHaveBeenCalled();
  });

  it('submits discharge with whitespace-only note as empty obs, removes patient from bed, and shows success snackbar', async () => {
    const user = userEvent.setup();

    mockCreateEncounter.mockResolvedValueOnce({ ok: true } as unknown as FetchResponse);
    mockRemovePatientFromBed.mockResolvedValueOnce({ ok: true } as unknown as FetchResponse);

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.clear(noteInput);
    await user.type(noteInput, '   ');

    submitDischargeForm();

    await waitFor(() => {
      expect(mockCreateEncounter).toHaveBeenCalledWith(
        mockWardPatient.patient,
        { uuid: 'exit-encounter', display: '' },
        mockWardPatient.visit.uuid,
        [],
      );
    });

    // Then verify all other calls happened
    expect(mockRemovePatientFromBed).toHaveBeenCalledWith(mockWardPatient.bed.id, mockWardPatient.patient.uuid);
    expect(mockWardPatientMutate).toHaveBeenCalled();
    expect(mockShowSnackbar).toHaveBeenCalledWith({
      title: 'Patient was discharged',
      kind: 'success',
    });
    expect(testProps.closeWorkspace).toHaveBeenCalledWith({ discardUnsavedChanges: true });
    expect(mockCloseWorkspaceGroup2).toHaveBeenCalled();
  });

  it('disables discharge button during submission', async () => {
    const user = userEvent.setup();

    mockCreateEncounter.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100)),
    );
    mockRemovePatientFromBed.mockResolvedValueOnce({ ok: true } as unknown as FetchResponse);

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');

    expect(screen.getByRole('button', { name: /Confirm discharge/i })).toBeEnabled();

    submitDischargeForm();

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByText(/Discharging/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(testProps.closeWorkspace).toHaveBeenCalled();
    });
  });

  it('disables cancel button during submission', async () => {
    const user = userEvent.setup();

    mockCreateEncounter.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100)),
    );
    mockRemovePatientFromBed.mockResolvedValueOnce({ ok: true } as unknown as FetchResponse);

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');

    submitDischargeForm();

    // Wait for loading state to appear, then check if cancel button is disabled
    await waitFor(() => {
      expect(screen.getByText(/Discharging/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();

    await waitFor(() => {
      expect(testProps.closeWorkspace).toHaveBeenCalled();
    });
  });

  it('shows globalErrors message when available in error response', async () => {
    mockCreateEncounter.mockRejectedValueOnce({
      responseBody: { error: { globalErrors: [{ message: 'Global validation error' }] } },
    });

    render(<PatientDischargeWorkspace {...testProps} />);

    submitDischargeForm();

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Error discharging patient',
        subtitle: 'Global validation error',
        kind: 'error',
      });
    });
  });

  it('shows error snackbar when discharge fails', async () => {
    const user = userEvent.setup();
    mockCreateEncounter.mockRejectedValueOnce({ message: 'Discharge failed' });

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');
    submitDischargeForm();

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Error discharging patient',
        subtitle: 'Discharge failed',
        kind: 'error',
      });
    });
  });

  it('shows fallback error message when error has no message', async () => {
    const user = userEvent.setup();

    mockCreateEncounter.mockRejectedValueOnce({});

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');
    submitDischargeForm();

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Error discharging patient',
        subtitle: 'Unable to discharge patient. Please try again.',
        kind: 'error',
      });
    });
  });

  it('calls mutate when discharge fails', async () => {
    const user = userEvent.setup();
    mockCreateEncounter.mockRejectedValueOnce({ message: 'Network issue' });

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');
    submitDischargeForm();

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });

    expect(mockWardPatientMutate).toHaveBeenCalled();
  });

  it('re-enables buttons after failed discharge', async () => {
    const user = userEvent.setup();
    mockCreateEncounter.mockRejectedValueOnce({ message: 'Network issue' });

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');

    const dischargeButton = screen.getByRole('button', { name: /Confirm discharge/i });
    submitDischargeForm();

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });

    expect(dischargeButton).toBeEnabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeEnabled();
  });
});
