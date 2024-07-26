import React from 'react';
import { screen } from '@testing-library/react';
import AdmissionRequestsWorkspace from './admission-requests.workspace';
import { defineConfigSchema } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { mockInpatientRequest, mockLocationInpatientWard } from '__mocks__';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import { configSchema } from '../config-schema';
import useWardLocation from '../hooks/useWardLocation';

defineConfigSchema('@openmrs/esm-ward-app', configSchema);

jest.mock('../hooks/useInpatientRequest', () => ({
  useInpatientRequest: jest.fn(),
}));

jest.mock('../hooks/useWardLocation', () => jest.fn());

const mockUseWardLocation = useWardLocation as jest.Mock;
mockUseWardLocation.mockReturnValue({
  location: mockLocationInpatientWard,
  isLoadingLocation: false,
  errorFetchingLocation: null,
  invalidLocation: false,
});

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
    expect(screen.getByText(mockInpatientRequest.patient.person?.preferredName?.display)).toBeInTheDocument();
  });
});
