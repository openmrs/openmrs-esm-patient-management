import { renderWithSwr } from '../../../../tools/test-utils';
import React from 'react';
import AdmissionRequestsWorkspace from './admission-requests-workspace.component';
import { ConfigSchema, Person, closeWorkspace, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema } from '../config-schema';
import { useDisposition } from '../hooks/useDisposition';
import { mockAdmissionRequest } from '../../../../__mocks__/admissionRequest.mock';

jest.replaceProperty(mockAdmissionRequest.patient.person as Person, 'preferredName', {
  uuid: '',
  givenName: 'Alice',
  familyName: 'Johnson',
});

jest.mocked(useConfig).mockReturnValue({
  ...getDefaultsFromConfigSchema<ConfigSchema>(configSchema),
});

jest.mock('../hooks/useDisposition', () => ({
  useDisposition: jest.fn(),
}));
const mockAdmissionRequestResponse = {
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  admissionRequests: [mockAdmissionRequest],
};
jest.mocked(useDisposition).mockReturnValue(mockAdmissionRequestResponse);

jest.mock('@openmrs/esm-framework', () => {
  return {
    ...jest.requireActual('@openmrs/esm-framework'),
    closeWorkspace: jest.fn(),
  };
});

describe('Admission Requests Workspace', () => {
  it('should render a admission request card', () => {
    const { getByText } = renderWithSwr(<AdmissionRequestsWorkspace />);
    const { givenName, familyName } = mockAdmissionRequest.patient.person.preferredName;
    expect(getByText(givenName + ' ' + familyName)).toBeInTheDocument();
  });

  it('close workspace should be called when there is error in api', () => {
    const replacedMockResponse = jest.replaceProperty(mockAdmissionRequestResponse, 'error', true);
    renderWithSwr(<AdmissionRequestsWorkspace />);
    expect(closeWorkspace).toHaveBeenCalled();
    replacedMockResponse.restore();
  });
});
