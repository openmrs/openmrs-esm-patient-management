import React from 'react';
import { vi, describe, it, expect } from 'vitest';
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

vi.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);
const mockUseWorkspace2Context = vi.mocked(useWorkspace2Context);
mockUseWorkspace2Context.mockReturnValue({
  closeWorkspace: vi.fn(),
  launchChildWorkspace: vi.fn(),
  showActionMenu: false,
  workspaceProps: undefined,
  windowProps: undefined,
  groupProps: undefined,
  workspaceName: '',
  windowName: '',
  isRootWorkspace: false,
});

const mockUseVisit = vi.mocked(useVisit).mockReturnValue({
  activeVisit: {
    encounters: [],
    startDatetime: new Date().toISOString(),
    uuid: 'mock-visit',
    visitType: { display: 'Some Visit Type', uuid: 'some-visit-type-uuid' },
    stopDatetime: null,
  },
  currentVisit: null,
  currentVisitIsRetrospective: null,
  mutate: vi.fn(),
  error: undefined,
  isLoading: false,
  isValidating: false,
});

vi.mock('../../hooks/useWardLocation', () => ({ default: vi.fn() }));
const mockedUseWardLocation = vi.mocked(useWardLocation);
mockedUseWardLocation.mockReturnValue({
  location: mockLocationInpatientWard,
  isLoadingLocation: false,
  errorFetchingLocation: null,
  invalidLocation: false,
});

vi.mock('../../hooks/useRestPatient', () => ({ default: vi.fn() }));
const mockUseRestPatient = vi.mocked(useRestPatient).mockReturnValue({
  patient: mockPatientAlice,
  isLoading: false,
  error: null,
  isValidating: false,
  mutate: vi.fn(),
});

vi.mock('../../hooks/useAssignedBedByPatient', () => ({
  useAssignedBedByPatient: vi.fn(),
}));

// @ts-ignore - we don't need to mock the entire object
vi.mocked(useAssignedBedByPatient).mockReturnValue({
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

vi.mock('../../hooks/useInpatientAdmissionByPatients', () => ({
  useInpatientAdmissionByPatients: vi.fn(),
}));
const mockedUseInpatientAdmissionByPatients = vi.mocked(useInpatientAdmissionByPatients).mockReturnValue({
  data: [],
  hasMore: false,
  loadMore: vi.fn(),
  isValidating: false,
  isLoading: false,
  error: undefined,
  mutate: vi.fn(),
  totalCount: mockInpatientAdmissions.length,
  nextUri: null,
});

vi.mock('../../hooks/useInpatientRequestByPatients', () => ({
  useInpatientRequestByPatients: vi.fn(),
}));
const mockedUseInpatientRequestByPatients = vi.mocked(useInpatientRequestByPatients).mockReturnValue({
  inpatientRequests: [],
  hasMore: false,
  loadMore: vi.fn(),
  isValidating: false,
  isLoading: false,
  error: undefined,
  mutate: vi.fn(),
  totalCount: mockInpatientAdmissions.length,
  nextUri: null,
});

vi.mock('../../hooks/useEmrConfiguration', () => ({ default: vi.fn() }));
vi.mocked(useEmrConfiguration).mockReturnValue({
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

vi.mock('../../ward.resource', () => ({
  useAdmitPatient: vi.fn(),
  assignPatientToBed: vi.fn(),
  removePatientFromBed: vi.fn(),
}));
const mockedUseAdmitPatient: ReturnType<typeof useAdmitPatient> = {
  admitPatient: vi.fn(),
  isLoadingEmrConfiguration: false,
  errorFetchingEmrConfiguration: false,
};
vi.mocked(useAdmitPatient).mockReturnValue(mockedUseAdmitPatient);
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
      loadMore: vi.fn(),
      isValidating: false,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
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
      loadMore: vi.fn(),
      isValidating: false,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
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
      loadMore: vi.fn(),
      isValidating: false,
      isLoading: false,
      error: undefined,
      mutate: vi.fn(),
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
      closeWorkspace={vi.fn()}
      launchChildWorkspace={vi.fn()}
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
