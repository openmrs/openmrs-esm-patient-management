import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithSwr } from '../../../../../tools';
import AdmitPatientFormWorkspace from './admit-patient-form.workspace';
import {
  mockAdmissionLocation,
  mockInpatientAdmissions,
  mockInpatientRequest,
  mockLocationInpatientWard,
  mockPatientAlice,
} from '../../../../../__mocks__';
import type { DispositionType } from '../../types';
import type { AdmitPatientFormWorkspaceProps } from './types';
import { useAdmissionLocation } from '../../hooks/useAdmissionLocation';
import { openmrsFetch, provide, showSnackbar, useAppContext, useFeatureFlag, useSession } from '@openmrs/esm-framework';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import useWardLocation from '../../hooks/useWardLocation';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import { getInpatientAdmissionsUuidMap, createAndGetWardPatientGrouping } from '../../ward-view/ward-view.resource';
import { useInpatientAdmission } from '../../hooks/useInpatientAdmission';

jest.mock('../../hooks/useAdmissionLocation', () => ({
  useAdmissionLocation: jest.fn(),
}));

jest.mock('../../hooks/useWardLocation', () => jest.fn());

jest.mock('../../hooks/useEmrConfiguration', () => jest.fn());

jest.mock('../../hooks/useInpatientRequest', () => ({
  useInpatientRequest: jest.fn(),
}));

jest.mock('../../hooks/useWardPatientGrouping', () => ({
  useWardPatientGrouping: jest.fn(),
}));

jest.mock('../../hooks/useInpatientAdmission', () => ({
  useInpatientAdmission: jest.fn(),
}));

const inpatientAdmissionsUuidMap = getInpatientAdmissionsUuidMap(mockInpatientAdmissions);

const mockedUseInpatientRequest = jest.mocked(useInpatientRequest);
const mockedUseEmrConfiguration = jest.mocked(useEmrConfiguration);
const mockedUseWardLocation = jest.mocked(useWardLocation);
const mockedOpenmrsFetch = jest.mocked(openmrsFetch);
const mockedUseAdmissionLocation = jest.mocked(useAdmissionLocation).mockReturnValue({
  isLoading: false,
  isValidating: false,
  admissionLocation: mockAdmissionLocation,
  mutate: jest.fn(),
  error: undefined,
});
const mockedUseFeatureFlag = jest.mocked(useFeatureFlag);
const mockedShowSnackbar = jest.mocked(showSnackbar);
const mockedUseSession = jest.mocked(useSession);
const mockInpatientAdmissionResponse = jest.mocked(useInpatientAdmission).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  inpatientAdmissions: mockInpatientAdmissions,
});
const mockWardPatientGroupDetails = jest.mocked(useWardPatientGrouping).mockReturnValue({
  admissionLocationResponse: mockedUseAdmissionLocation(),
  inpatientAdmissionResponse: mockInpatientAdmissionResponse(),
  ...createAndGetWardPatientGrouping(mockInpatientAdmissions, mockAdmissionLocation, inpatientAdmissionsUuidMap),
});
jest.mocked(useAppContext).mockReturnValue(mockWardPatientGroupDetails());

const mockWorkspaceProps: AdmitPatientFormWorkspaceProps = {
  patient: mockPatientAlice,
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
  dispositionType: 'ADMIT',
};

function renderAdmissionForm(dispositionType: DispositionType = 'ADMIT') {
  renderWithSwr(<AdmitPatientFormWorkspace {...{ ...mockWorkspaceProps, dispositionType }} />);
}

const mockedMutateInpatientRequest = jest.fn();

describe('Testing AdmitPatientForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseSession.mockReturnValue({
      currentProvider: {
        uuid: 'current-provider-uuid',
        identifier: 'current-provider-identifier',
      },
      authenticated: true,
      sessionId: 'session-id',
    });
    mockedUseFeatureFlag.mockReturnValue(true);
    mockedUseEmrConfiguration.mockReturnValue({
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
      // @ts-ignore - we only need these two keys for now
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
    mockedUseInpatientRequest.mockReturnValue({
      mutate: mockedMutateInpatientRequest,
      error: undefined,
      inpatientRequests: [mockInpatientRequest],
      isLoading: false,
      isValidating: false,
    });
    mockedUseWardLocation.mockReturnValue({
      location: mockLocationInpatientWard,
      invalidLocation: false,
      isLoadingLocation: false,
      errorFetchingLocation: null,
    });
  });

  it('should render admit patient form', async () => {
    const user = userEvent.setup();
    renderAdmissionForm();
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    expect(mockWorkspaceProps.closeWorkspace).toHaveBeenCalledWith({
      ignoreChanges: true,
    });
    screen.getByText('Admit');
    expect(screen.getByText('Select a bed')).toBeInTheDocument();
    await user.click(
      screen.getByRole('combobox', {
        name: 'Choose an option',
      }),
    );
    expect(screen.getByText('bed1 · Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('bed2 · Empty')).toBeInTheDocument();
    expect(screen.getByText('bed3 · Empty')).toBeInTheDocument();
    expect(screen.getByText('bed4 · Empty')).toBeInTheDocument();
  });

  it('should block the form if emr configuration is not fetched properly', () => {
    mockedUseEmrConfiguration.mockReturnValue({
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: true,
      emrConfiguration: null,
      mutateEmrConfiguration: jest.fn(),
    });

    renderAdmissionForm();

    const admitButton = screen.getByText('Admit');
    expect(admitButton).toBeDisabled();
    expect(screen.getByText("Some parts of the form didn't load")).toBeInTheDocument();
    expect(
      screen.getByText(
        'Fetching EMR configuration failed. Try refreshing the page or contact your system administrator.',
      ),
    ).toBeInTheDocument();
  });

  it('should render admit patient form if bed management module is not present', () => {
    mockedUseFeatureFlag.mockReturnValue(false);
    renderAdmissionForm();
    expect(screen.getByText('Select a bed')).toBeInTheDocument();
    expect(screen.getByText('Unable to select beds')).toBeInTheDocument();
    expect(screen.getByText('Bed management module is not present to allow bed selection')).toBeInTheDocument();
  });

  it('should render admit patient form if bed management module is present, but no beds are configured', () => {
    mockedUseFeatureFlag.mockReturnValue(true);
    const replacedProperty = jest.replaceProperty(mockWardPatientGroupDetails(), 'bedLayouts', []);
    // @ts-i
    renderAdmissionForm();
    expect(screen.getByText('Select a bed')).toBeInTheDocument();
    expect(screen.getByText('No beds configured for Inpatient Ward location')).toBeInTheDocument();
    replacedProperty.restore();
  });

  it('should submit the form, create encounter and submit bed', async () => {
    // @ts-ignore - we only need these two keys for now
    mockedOpenmrsFetch.mockResolvedValue({
      ok: true,
      data: {
        uuid: 'encounter-uuid',
      },
    });
    const user = userEvent.setup();
    renderAdmissionForm();
    const combobox = screen.getByRole('combobox', {
      name: 'Choose an option',
    });
    await user.click(combobox);
    const bedOption = screen.getByText('bed3 · Empty');
    await user.click(bedOption);
    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    await user.click(admitButton);
    expect(mockedOpenmrsFetch).toHaveBeenCalledTimes(2);
    expect(mockedOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/encounter', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        patient: mockPatientAlice.uuid,
        encounterType: 'admission-encounter-type-uuid',
        location: mockAdmissionLocation.ward.uuid,
        obs: [],
        encounterProviders: [
          {
            provider: 'current-provider-uuid',
            encounterRole: 'clinician-encounter-role-uuid',
          },
        ],
      },
    });
    expect(mockedOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/beds/3', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        patientUuid: mockPatientAlice.uuid,
        encounterUuid: 'encounter-uuid',
      },
    });
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      subtitle: '{{patientName}} has been successfully admitted and assigned to bed bed3',
      title: 'Patient admitted successfully',
    });
  });

  it('should show snackbar if there was an issue creating an encounter', async () => {
    mockedOpenmrsFetch.mockRejectedValue(new Error('Failed to create encounter'));
    const user = userEvent.setup();
    renderAdmissionForm();
    const combobox = screen.getByRole('combobox', {
      name: 'Choose an option',
    });
    await user.click(combobox);
    const bedOption = screen.getByText('bed3 · Empty');
    await user.click(bedOption);
    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    await user.click(admitButton);
    expect(mockedOpenmrsFetch).toHaveBeenCalledTimes(1);
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'error',
      title: 'Failed to admit patient',
      subtitle: 'Failed to create encounter',
    });
  });

  it('should show warning snackbar if encounter was created and bed assignment was not successful', async () => {
    // @ts-ignore - matching whole FetchResponse type is not necessary
    mockedOpenmrsFetch.mockImplementation((url) => {
      if (url.startsWith('/ws/rest/v1/beds')) {
        return Promise.reject(new Error('Failed to assign bed'));
      }
      return Promise.resolve({
        ok: true,
        data: {
          uuid: 'encounter-uuid',
        },
      });
    });

    const user = userEvent.setup();
    renderAdmissionForm();
    const combobox = screen.getByRole('combobox', {
      name: 'Choose an option',
    });
    await user.click(combobox);
    const bedOption = screen.getByText('bed3 · Empty');
    await user.click(bedOption);
    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    await user.click(admitButton);
    expect(mockedOpenmrsFetch).toHaveBeenCalledTimes(2);
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'warning',
      title: 'Patient admitted successfully',
      subtitle: 'Patient admitted successfully but fail to assign bed to patient',
    });
  });

  it('should admit patient if no beds are configured', async () => {
    const replacedProperty = jest.replaceProperty(mockWardPatientGroupDetails(), 'bedLayouts', []);
    // @ts-ignore - we only need these two keys for now
    mockedOpenmrsFetch.mockResolvedValue({
      ok: true,
      data: {
        uuid: 'encounter-uuid',
      },
    });
    const user = userEvent.setup();
    renderAdmissionForm();
    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    await user.click(admitButton);
    expect(mockedOpenmrsFetch).toHaveBeenCalledTimes(1);
    expect(mockedOpenmrsFetch).toHaveBeenCalledWith('/ws/rest/v1/encounter', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        patient: mockPatientAlice.uuid,
        encounterType: 'admission-encounter-type-uuid',
        location: mockAdmissionLocation.ward.uuid,
        obs: [],
        encounterProviders: [
          {
            provider: 'current-provider-uuid',
            encounterRole: 'clinician-encounter-role-uuid',
          },
        ],
      },
    });
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      subtitle: 'Patient admitted successfully to Inpatient Ward',
      title: 'Patient admitted successfully',
    });
    replacedProperty.restore();
  });
});
