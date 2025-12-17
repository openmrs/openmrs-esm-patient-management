import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { closeWorkspaceGroup2, showModal, showSnackbar, useAppContext } from '@openmrs/esm-framework';
import { useCreateEncounter, removePatientFromBed } from '../../ward.resource';
import PatientDischargeWorkspace from './patient-discharge.workspace';
import { mockInpatientRequestAlice, mockPatientAlice, mockVisitAlice } from '__mocks__';
import type { WardPatient, WardPatientWorkspaceDefinition } from '../../types';

const mockShowModal = jest.mocked(showModal);
const mockShowSnackbar = jest.mocked(showSnackbar);
const mockUseCreateEncounter = jest.mocked(useCreateEncounter);
const mockRemovePatientFromBed = jest.mocked(removePatientFromBed);
const mockUseAppContext = jest.mocked(useAppContext);
const mockCloseWorkspaceGroup2 = jest.mocked(closeWorkspaceGroup2);

jest.mock('../../ward.resource', () => ({
  useCreateEncounter: jest.fn(),
  removePatientFromBed: jest.fn(),
}));

jest.mock('../patient-banner/patient-banner.component', () => () => <div>patient-banner</div>);

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
  inpatientAdmission: null as any,
  inpatientRequest: mockInpatientRequestAlice as any,
};

const testProps: WardPatientWorkspaceDefinition = {
  groupProps: { wardPatient: mockWardPatient },
  closeWorkspace: jest.fn(),
  launchChildWorkspace: jest.fn(),
  workspaceProps: null,
  windowProps: null,
  workspaceName: 'discharge',
  windowName: 'discharge',
  isRootWorkspace: false,
};

describe('PatientDischargeWorkspace', () => {
  const mockCreateEncounter = jest.fn();
  const mockWardPatientMutate = jest.fn();

  beforeEach(() => {
    mockUseCreateEncounter.mockReturnValue({
      createEncounter: mockCreateEncounter,
      emrConfiguration: {
        consultFreeTextCommentsConcept: { uuid: 'consult-concept' },
        exitFromInpatientEncounterType: { uuid: 'exit-encounter' } as any,
      } as any,
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });

    mockUseAppContext.mockReturnValue({
      wardPatientGroupDetails: { mutate: mockWardPatientMutate },
    } as any);

    // Mock showModal to automatically call onConfirm
    mockShowModal.mockImplementation((modalName, props: any) => {
      if (props.onConfirm) {
        props.onConfirm();
      }
      return jest.fn();
    });
  });

  it('renders discharge workspace with note field and action buttons', () => {
    render(<PatientDischargeWorkspace {...testProps} />);

    expect(screen.getByPlaceholderText(/write any notes here/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /discharge/i })).toBeInTheDocument();
  });

  it('calls closeWorkspace when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<PatientDischargeWorkspace {...testProps} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(testProps.closeWorkspace).toHaveBeenCalled();
  });

  it('submits discharge, shows confirm modal, removes patient from bed, and shows success snackbar', async () => {
    const user = userEvent.setup();

    mockCreateEncounter.mockResolvedValueOnce({ ok: true } as any);
    mockRemovePatientFromBed.mockResolvedValueOnce({ ok: true } as any);

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.clear(noteInput);
    await user.type(noteInput, 'Patient recovered');

    await user.click(screen.getByRole('button', { name: /discharge/i }));

    // Verify modal was shown
    expect(mockShowModal).toHaveBeenCalledWith('PatientDischargeConfirmationModal', {
      closeModal: expect.any(Function),
      onConfirm: expect.any(Function),
    });

    // Wait for the discharge process to complete (onConfirm is called automatically by mock)
    await waitFor(() => {
      expect(mockCreateEncounter).toHaveBeenCalledWith(
        mockWardPatient.patient,
        { uuid: 'exit-encounter' },
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

  it('shows validation message when submitting without discharge note', async () => {
    const user = userEvent.setup();

    render(<PatientDischargeWorkspace {...testProps} />);

    await user.click(screen.getByRole('button', { name: /discharge/i }));

    expect(await screen.findByText(/discharge note is required/i)).toBeInTheDocument();
    expect(mockShowModal).not.toHaveBeenCalled();
    expect(mockCreateEncounter).not.toHaveBeenCalled();
  });

  it('shows error snackbar when discharge fails', async () => {
    const user = userEvent.setup();
    mockCreateEncounter.mockRejectedValueOnce({ message: 'Network issue' });

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');
    await user.click(screen.getByRole('button', { name: /discharge/i }));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Error discharging patient',
        subtitle: 'Network issue',
        kind: 'error',
      });
    });
  });

  it('disables discharge button during submission', async () => {
    const user = userEvent.setup();
    mockCreateEncounter.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ ok: true }), 100)),
    );
    mockRemovePatientFromBed.mockResolvedValueOnce({ ok: true } as any);

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');

    const dischargeButton = screen.getByRole('button', { name: /discharge/i });
    expect(dischargeButton).toBeEnabled();

    await user.click(dischargeButton);

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByText(/discharging/i)).toBeInTheDocument();
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
    mockRemovePatientFromBed.mockResolvedValueOnce({ ok: true } as any);

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');

    await user.click(screen.getByRole('button', { name: /discharge/i }));

    // Wait for loading state to appear, then check if cancel button is disabled
    await waitFor(() => {
      expect(screen.getByText(/discharging/i)).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    expect(cancelButton).toBeDisabled();

    await waitFor(() => {
      expect(testProps.closeWorkspace).toHaveBeenCalled();
    });
  });

  it('shows error message from responseBody when discharge fails', async () => {
    const user = userEvent.setup();

    mockCreateEncounter.mockRejectedValueOnce(new Error('Discharge failed'));

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');
    await user.click(screen.getByRole('button', { name: /discharge/i }));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith({
        title: 'Error discharging patient',
        subtitle: 'Discharge failed',
        kind: 'error',
      });
    });
  });

  it('does not call mutate when discharge fails', async () => {
    const user = userEvent.setup();
    mockCreateEncounter.mockRejectedValueOnce({ message: 'Network issue' });

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');
    await user.click(screen.getByRole('button', { name: /discharge/i }));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });

    expect(mockWardPatientMutate).not.toHaveBeenCalled();
  });

  it('re-enables buttons after failed discharge', async () => {
    const user = userEvent.setup();
    mockCreateEncounter.mockRejectedValueOnce({ message: 'Network issue' });

    render(<PatientDischargeWorkspace {...testProps} />);

    const noteInput = screen.getByPlaceholderText(/write any notes here/i);
    await user.type(noteInput, 'Patient recovered');

    const dischargeButton = screen.getByRole('button', { name: /discharge/i });
    await user.click(dischargeButton);

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(expect.objectContaining({ kind: 'error' }));
    });

    expect(dischargeButton).toBeEnabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeEnabled();
  });
});
