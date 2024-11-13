import { useAppContext } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithSwr } from '../../../../../tools';
import { mockWardViewContext } from '../../../mock';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import { type WardViewContext } from '../../types';
import DefaultWardPendingPatients from '../../ward-view/default-ward/default-ward-pending-patients.component';
import AdmissionRequestsWorkspace, { type AdmissionRequestsWorkspaceProps } from './admission-requests.workspace';

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

jest.mock('../../hooks/useEmrConfiguration', () => jest.fn());
const mockedUseEmrConfiguration = jest.mocked(useEmrConfiguration);

const workspaceProps: AdmissionRequestsWorkspaceProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
  wardPendingPatients: <DefaultWardPendingPatients />,
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
      mutateEmrConfiguration: jest.fn(),
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
      mutateEmrConfiguration: jest.fn(),
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
