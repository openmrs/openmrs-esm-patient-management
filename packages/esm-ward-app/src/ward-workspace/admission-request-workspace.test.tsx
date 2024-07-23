import React from 'react';
import { screen } from '@testing-library/react';
import AdmissionRequestsWorkspace from './admission-requests-workspace.component';
import { type ConfigSchema, type Person, getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { renderWithSwr } from 'tools';
import { mockInpatientRequest } from '__mocks__';
import { configSchema } from '../config-schema';

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
    renderWithSwr(<AdmissionRequestsWorkspace admissionRequests={[mockInpatientRequest]} />);
    const { givenName, familyName } = mockInpatientRequest.patient.person!.preferredName!;
    expect(screen.getByText(givenName + ' ' + familyName)).toBeInTheDocument();
  });
});
