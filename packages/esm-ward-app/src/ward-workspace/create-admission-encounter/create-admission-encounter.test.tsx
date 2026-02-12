import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppContext, useVisit, useWorkspace2Context } from '@openmrs/esm-framework';
import {
  mockInpatientAdmissions,
  mockInpatientRequests,
  mockLocationInpatientWard,
  mockLocationMosoriot,
  mockPatientAlice,
} from '__mocks__';
import { renderWithSwr } from '../../../../../tools';
import { mockWardViewContext } from '../../../mock';
import { useAssignedBedByPatient } from '../../hooks/useAssignedBedByPatient';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import { useInpatientAdmissionByPatients } from '../../hooks/useInpatientAdmissionByPatients';
import { useInpatientRequestByPatients } from '../../hooks/useInpatientRequestByPatients';
import useRestPatient from '../../hooks/useRestPatient';
import useWardLocation from '../../hooks/useWardLocation';
import { type WardViewContext } from '../../types';
import { useAdmitPatient } from '../../ward.resource';
import CreateAdmissionEncounterWorkspace from './create-admission-encounter.workspace';

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);
const mockUseWorkspace2Context = jest.mocked(useWorkspace2Context);
mockUseWorkspace2Context.mockReturnValue({
  closeWorkspace: jest.fn(),
  launchChildWorkspace: jest.fn(),
  showActionMenu: false,
  workspaceProps: undefined,
  windowProps: undefined,
  groupProps: undefined,
  workspaceName: '',
  windowName: '',
  isRootWorkspace: false,
});

const mockUseVisit = jest.mocked(useVisit).mockReturnValue({
  activeVisit: {
    encounters: [],
    startDatetime: new Date().toISOString(),
    uuid: 'mock-visit',
    visitType: { display: 'Some Visit Type', uuid: 'some-visit-type-uuid' },
    stopDatetime: null,
  },
  currentVisit: null,
  currentVisitIsRetrospective: null,
  mutate: jest.fn(),
  error: undefined,
  isLoading: false,
  isValidating: false,
});

jest.mock('../../hooks/useWardLocation', () => jest.fn());
const mockedUseWardLocation = jest.mocked(useWardLocation);
mockedUseWardLocation.mockReturnValue({
  location: mockLocationInpatientWard,
  isLoadingLocation: false,
  errorFetchingLocation: null,
  invalidLocation: false,
});

jest.mock('../../hooks/useRestPatient', () => jest.fn());
const mockUseRestPatient = jest.mocked(useRestPatient).mockReturnValue({
  patient: mockPatientAlice,
  isLoading: false,
  error: null,
  isValidating: false,
  mutate: jest.fn(),
});

jest.mock('../../hooks/useAssignedBedByPatient', () => ({
  useAssignedBedByPatient: jest.fn(),
}));

// @ts-ignore - we don't need to mock the entire object
jest.mocked(useAssignedBedByPatient).mockReturnValue({
  data: {
    data: {
      results: [
        {
          bedId: 1,
          bedNumber: '1',
          bedType: null,
          patients: [mockPatientAlice],
          physicalLocation: mockLocationInpatientWard,
        },
      ],
    },
  },
  isLoading: false,
});

jest.mock('../../hooks/useInpatientAdmissionByPatients', () => ({
  useInpatientAdmissionByPatients: jest.fn(),
}));
const mockedUseInpatientAdmissionByPatients = jest.mocked(useInpatientAdmissionByPatients).mockReturnValue({
  data: [],
  hasMore: false,
  loadMore: jest.fn(),
  isValidating: false,
  isLoading: false,
  error: undefined,
  mutate: jest.fn(),
  totalCount: mockInpatientAdmissions.length,
  nextUri: null,
});

jest.mock('../../hooks/useInpatientRequestByPatients', () => ({
  useInpatientRequestByPatients: jest.fn(),
}));
const mockedUseInpatientRequestByPatients = jest.mocked(useInpatientRequestByPatients).mockReturnValue({
  inpatientRequests: [],
  hasMore: false,
  loadMore: jest.fn(),
  isValidating: false,
  isLoading: false,
  error: undefined,
  mutate: jest.fn(),
  totalCount: mockInpatientAdmissions.length,
  nextUri: null,
});

jest.mock('../../hooks/useEmrConfiguration', () => jest.fn());
jest.mocked(useEmrConfiguration).mockReturnValue({
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

jest.mock('../../ward.resource', () => ({
  useAdmitPatient: jest.fn(),
  assignPatientToBed: jest.fn(),
  removePatientFromBed: jest.fn(),
}));
const mockedUseAdmitPatient: ReturnType<typeof useAdmitPatient> = {
  admitPatient: jest.fn(),
  isLoadingEmrConfiguration: false,
  errorFetchingEmrConfiguration: false,
};
jest.mocked(useAdmitPatient).mockReturnValue(mockedUseAdmitPatient);
const mockedAdmitPatient = mockedUseAdmitPatient.admitPatient;
// @ts-ignore - we only need these two keys for now
mockedAdmitPatient.mockResolvedValue({
  ok: true,
  data: {
    uuid: 'encounter-uuid',
  },
});

describe('CreateAdmissionEncounterWorkspace', () => {
  it('should render patient header and admit patient button', async () => {
    const user = userEvent.setup();
    renderCreateAdmissionEncounterWorkspace(mockPatientAlice.uuid);
    expect(screen.getByText(mockPatientAlice.person?.preferredName?.display)).toBeInTheDocument();
    const admitPatientButton = screen.getByRole('button', { name: /admit patient/i });
    expect(admitPatientButton).toBeEnabled();

    await user.click(admitPatientButton);
    expect(mockedAdmitPatient).toHaveBeenCalledWith(expect.any(Object), 'ADMIT', 'mock-visit');
  });
  it('should have warning when patient has a pending admission request', async () => {
    mockedUseInpatientRequestByPatients.mockReturnValueOnce({
      inpatientRequests: mockInpatientRequests,
      hasMore: false,
      loadMore: jest.fn(),
      isValidating: false,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
      totalCount: mockInpatientAdmissions.length,
      nextUri: null,
    });
    const user = userEvent.setup();
    renderCreateAdmissionEncounterWorkspace(mockPatientAlice.uuid);
    expect(screen.getByText(mockPatientAlice.person?.preferredName?.display)).toBeInTheDocument();
    expect(
      screen.getByText(
        'Patient already has a pending admission request to location ' + mockLocationInpatientWard.display,
      ),
    ).toBeInTheDocument();
    const admitPatientButton = screen.getByRole('button', { name: /admit patient/i });
    expect(admitPatientButton).toBeEnabled();

    await user.click(admitPatientButton);
    expect(mockedAdmitPatient).toHaveBeenCalledWith(expect.any(Object), 'ADMIT', 'mock-visit');
  });

  it('should have warning when patient is already admitted elsewhere', async () => {
    mockedUseInpatientAdmissionByPatients.mockReturnValueOnce({
      data: [{ ...mockInpatientAdmissions[0], currentInpatientLocation: mockLocationMosoriot }],
      hasMore: false,
      loadMore: jest.fn(),
      isValidating: false,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
      totalCount: mockInpatientAdmissions.length,
      nextUri: null,
    });
    const user = userEvent.setup();
    renderCreateAdmissionEncounterWorkspace(mockPatientAlice.uuid);
    expect(screen.getByText(mockPatientAlice.person?.preferredName?.display)).toBeInTheDocument();
    expect(screen.getByText('Patient currently admitted to ' + mockLocationMosoriot.display)).toBeInTheDocument();
    const admitPatientButton = screen.getByRole('button', { name: /transfer patient/i });
    expect(admitPatientButton).toBeEnabled();

    await user.click(admitPatientButton);
    expect(mockedAdmitPatient).toHaveBeenCalledWith(expect.any(Object), 'TRANSFER', 'mock-visit');
  });

  it('should disable admit patient button when patient is already admitted to current location', () => {
    mockedUseInpatientAdmissionByPatients.mockReturnValueOnce({
      data: mockInpatientAdmissions,
      hasMore: false,
      loadMore: jest.fn(),
      isValidating: false,
      isLoading: false,
      error: undefined,
      mutate: jest.fn(),
      totalCount: mockInpatientAdmissions.length,
      nextUri: null,
    });
    renderCreateAdmissionEncounterWorkspace(mockPatientAlice.uuid);
    expect(screen.getByText(mockPatientAlice.person?.preferredName?.display)).toBeInTheDocument();
    expect(screen.getByText('Patient already admitted to current location')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /admit patient/i })).toBeDisabled();
  });
});

function renderCreateAdmissionEncounterWorkspace(patentUuid: string) {
  renderWithSwr(
    <CreateAdmissionEncounterWorkspace
      windowName={''}
      isRootWorkspace={false}
      showActionMenu={false}
      closeWorkspace={jest.fn()}
      launchChildWorkspace={jest.fn()}
      workspaceProps={{
        selectedPatientUuid: patentUuid,
      }}
      windowProps={{
        startVisitWorkspaceName: '',
      }}
      groupProps={undefined}
      workspaceName={''}
    />,
  );
}
