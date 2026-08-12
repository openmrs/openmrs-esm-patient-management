import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  useAppContext,
  useWorkspace2Context,
  type Visit,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { mockWardViewContext } from '../../../mock';
import { type WardViewContext } from '../../types';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import DefaultWardPendingPatients from '../../ward-view/default-ward/default-ward-pending-patients.component';
import AdmissionRequestsWorkspace, { type AdmissionRequestsWorkspaceProps } from './admission-requests.workspace';

vi.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);
const mockUseWorkspace2Context = vi.mocked(useWorkspace2Context);

vi.mock('../../hooks/useEmrConfiguration', () => ({ default: vi.fn() }));
const mockedUseEmrConfiguration = vi.mocked(useEmrConfiguration);

const workspaceProps: Workspace2DefinitionProps<AdmissionRequestsWorkspaceProps> = {
  closeWorkspace: vi.fn(),
  launchChildWorkspace: vi.fn(),
  workspaceProps: {
    wardPendingPatients: <DefaultWardPendingPatients />,
  },
  windowProps: undefined,
  groupProps: undefined,
  workspaceName: '',
  windowName: '',
  isRootWorkspace: false,
};

describe('Admission Requests Workspace', () => {
  beforeEach(() => {
    mockedUseEmrConfiguration.mockReturnValue({
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
      // @ts-ignore - we only need these keys for now
      emrConfiguration: {
        admissionEncounterType: {
          uuid: 'admission-encounter-type-uuid',
          display: 'Admission Encounter',
        },
        transferWithinHospitalEncounterType: {
          uuid: 'transfer-within-hospital-encounter-type-uuid',
          display: 'Transfer Within Hospital Encounter Type',
        },
        clinicianEncounterRole: {
          uuid: 'clinician-encounter-role-uuid',
        },
      },
      mutateEmrConfiguration: vi.fn(),
    });
    mockUseWorkspace2Context.mockReturnValue({
      closeWorkspace: vi.fn(),
      launchChildWorkspace: vi.fn(),
      workspaceProps: undefined,
      windowProps: undefined,
      groupProps: undefined,
      workspaceName: '',
      windowName: '',
      isRootWorkspace: false,
    });
  });

  it('should render an admission request card', () => {
    renderWithSwr(<AdmissionRequestsWorkspace {...workspaceProps} />);
    const alice = mockWardViewContext.wardPatientGroupDetails.inpatientRequestResponse.inpatientRequests[0].patient;
    expect(screen.getByText(alice.person?.preferredName?.display as string)).toBeInTheDocument();
  });

  it('should launch the patient search workspace with an admit select button', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AdmissionRequestsWorkspace {...workspaceProps} />);

    await user.click(screen.getByRole('button', { name: /add patient to ward/i }));
    expect(workspaceProps.launchChildWorkspace).toHaveBeenCalledWith(
      'ward-app-patient-search-workspace',
      expect.objectContaining({
        selectPatientButton: { text: 'Admit', requiresActiveVisit: true },
      }),
    );
  });

  it('should auto-launch the admission workspace after a visit is started from the search', async () => {
    const user = userEvent.setup();
    renderWithSwr(<AdmissionRequestsWorkspace {...workspaceProps} />);

    await user.click(screen.getByRole('button', { name: /add patient to ward/i }));
    const [, searchWorkspaceProps] = vi.mocked(workspaceProps.launchChildWorkspace).mock.lastCall;

    const launchChildWorkspace = vi.fn();
    searchWorkspaceProps.onVisitStarted(
      'test-patient-uuid',
      { id: 'test-patient-uuid' } as fhir.Patient,
      { uuid: 'test-visit-uuid' } as Visit,
      launchChildWorkspace,
      vi.fn(),
    );
    await vi.waitFor(() =>
      expect(launchChildWorkspace).toHaveBeenCalledWith('create-admission-encounter-workspace', {
        selectedPatientUuid: 'test-patient-uuid',
      }),
    );
  });

  it('should render an admission request card with disabled "admit patient" button when emr config fails to load', () => {
    mockedUseEmrConfiguration.mockReturnValue({
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: true,
      emrConfiguration: null,
      mutateEmrConfiguration: vi.fn(),
    });

    renderWithSwr(<AdmissionRequestsWorkspace {...workspaceProps} />);
    expect(screen.getByText("Some parts of the form didn't load")).toBeInTheDocument();
    expect(
      screen.getByText(
        'Fetching EMR configuration failed. Try refreshing the page or contact your system administrator.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Admit patient/i })).toBeDisabled();
  });
});
