import { renderWithSwr } from '../../../../tools/test-utils';
import React from 'react';
import AdmissionRequestsWorkspace from './admission-requests-workspace.component';
import {
  type ConfigSchema,
  type Person,
  closeWorkspace,
  getDefaultsFromConfigSchema,
  useConfig,
} from '@openmrs/esm-framework';
import { configSchema } from '../config-schema';
import { useInpatientRequest } from '../hooks/useInpatientRequest';
import { mockInpatientRequest } from '../../../../__mocks__/ward-patient';

jest.replaceProperty(mockInpatientRequest.patient.person as Person, 'preferredName', {
  uuid: '',
  givenName: 'Alice',
  familyName: 'Johnson',
});

jest.mocked(useConfig).mockReturnValue({
  ...getDefaultsFromConfigSchema<ConfigSchema>(configSchema),
});

jest.mock('@openmrs/esm-framework', () => {
  return {
    ...jest.requireActual('@openmrs/esm-framework'),
    closeWorkspace: jest.fn(),
  };
});

describe('Admission Requests Workspace', () => {
  it('should render a admission request card', () => {
    const { getByText } = renderWithSwr(<AdmissionRequestsWorkspace admissionRequests={[mockInpatientRequest]} />);
    const { givenName, familyName } = mockInpatientRequest.patient.person!.preferredName!;
    expect(getByText(givenName + ' ' + familyName)).toBeInTheDocument();
  });
});
