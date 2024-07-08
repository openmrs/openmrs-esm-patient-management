import React from 'react';
import { screen } from '@testing-library/react';
import AdmissionRequestsWorkspace from './admission-requests-workspace.component';
import {
  type ConfigSchema,
  getDefaultsFromConfigSchema,
  type Person,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
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
    usePatient: jest.fn(),
  };
});

const mockedUsePatient = usePatient as jest.Mock;

describe('Admission Requests Workspace', () => {
  beforeAll(() => {
    mockedUsePatient.mockReturnValue({
      patient: {
        ...mockInpatientRequest.patient,
        name: [
          {
            id: 'efdb246f-4142-4c12-a27a-9be60b9592e9',
            use: 'usual',
            family: 'Johnson',
            given: ['Alice'],
          },
        ],
      },
      isLoading: false,
      error: null,
      patientUuid: mockInpatientRequest.patient.uuid,
    });
  });

  it('should render a admission request card', () => {
    renderWithSwr(<AdmissionRequestsWorkspace admissionRequests={[mockInpatientRequest]} />);
    const { givenName, familyName } = mockInpatientRequest.patient.person!.preferredName!;
    expect(screen.getByText(givenName + ' ' + familyName)).toBeInTheDocument();
  });
});
