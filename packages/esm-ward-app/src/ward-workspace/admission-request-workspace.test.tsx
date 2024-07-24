import React from 'react';
import { screen } from '@testing-library/react';
import AdmissionRequestsWorkspace from './admission-requests-workspace.component';
import { defineConfigSchema, type Person } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { mockInpatientRequest } from '__mocks__';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import { configSchema } from '../config-schema';

defineConfigSchema('@openmrs/esm-ward-app', configSchema);

jest.replaceProperty(mockInpatientRequest.patient.person as Person, 'preferredName', {
  uuid: '',
  givenName: 'Alice',
  familyName: 'Johnson',
});

jest.mock('../hooks/useInpatientRequest', () => ({
  useInpatientRequest: jest.fn(),
}));

const mockInpatientRequestResponse = {
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  inpatientRequests: [mockInpatientRequest],
};
jest.mocked(useInpatientRequest).mockReturnValue(mockInpatientRequestResponse);

jest.mock('@openmrs/esm-framework', () => {
  return {
    ...jest.requireActual('@openmrs/esm-framework'),
    closeWorkspace: jest.fn(),
  };
});

const workspaceProps = {
  closeWorkspace: jest.fn(),
  promptBeforeClosing: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  setTitle: jest.fn(),
};

describe('Admission Requests Workspace', () => {
  it('should render a admission request card', () => {
    renderWithSwr(<AdmissionRequestsWorkspace {...workspaceProps} />);
    const { givenName, familyName } = mockInpatientRequest.patient.person!.preferredName!;
    expect(screen.getByText(givenName + ' ' + familyName)).toBeInTheDocument();
  });
});
