import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { useAppContext, useWorkspace2Context, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
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
