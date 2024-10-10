import { useAppContext } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import React from 'react';
import { renderWithSwr } from '../../../../../tools';
import { mockWardViewContext } from '../../../mock';
import { type WardViewContext } from '../../types';
import DefaultWardPendingPatients from '../../ward-view/default-ward/default-ward-pending-patients.component';
import AdmissionRequestsWorkspace, { type AdmissionRequestsWorkspaceProps } from './admission-requests.workspace';

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

const workspaceProps: AdmissionRequestsWorkspaceProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
  wardPendingPatients: <DefaultWardPendingPatients />,
};

describe('Admission Requests Workspace', () => {
  it('should render a admission request card', () => {
    renderWithSwr(<AdmissionRequestsWorkspace {...workspaceProps} />);
    const alice = mockWardViewContext.wardPatientGroupDetails.inpatientRequestResponse.inpatientRequests[0].patient;
    expect(screen.getByText(alice.person?.preferredName?.display as string)).toBeInTheDocument();
  });
});
