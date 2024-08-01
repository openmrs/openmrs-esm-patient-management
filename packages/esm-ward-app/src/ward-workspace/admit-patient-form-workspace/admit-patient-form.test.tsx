import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithSwr } from '../../../../../tools';
import AdmitPatientFormWorkspace from './admit-patient-form.workspace';
import {
  mockAdmissionLocation,
  mockInpatientRequest,
  mockLocationInpatientWard,
  mockPatientAlice,
} from '../../../../../__mocks__';
import type { DispositionType } from '../../types';
import type { AdmitPatientFormWorkspaceProps } from './types';
import { useAdmissionLocation } from '../../hooks/useAdmissionLocation';
import { openmrsFetch, showSnackbar, useFeatureFlag } from '@openmrs/esm-framework';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import useWardLocation from '../../hooks/useWardLocation';
import { useInpatientRequest } from '../../hooks/useInpatientRequest';

jest.mock('../../hooks/useAdmissionLocation', () => ({
  useAdmissionLocation: jest.fn(),
}));

jest.mock('../../hooks/useWardLocation', () => jest.fn());

jest.mock('../../hooks/useEmrConfiguration', () => jest.fn());

jest.mock('../../hooks/useInpatientRequest', () => ({
  useInpatientRequest: jest.fn(),
}));

const mockedUseInpatientRequest = jest.mocked(useInpatientRequest);
const mockedUseEmrConfiguration = jest.mocked(useEmrConfiguration);
const mockedUseWardLocation = jest.mocked(useWardLocation);
const mockedOpenmrsFetch = jest.mocked(openmrsFetch);
const mockedUseAdmissionLocation = jest.mocked(useAdmissionLocation);
const mockedUseFeatureFlag = jest.mocked(useFeatureFlag);
const mockedShowSnackbar = jest.mocked(showSnackbar);

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
    mockedUseAdmissionLocation.mockReturnValue({
      isLoading: false,
      isValidating: false,
      admissionLocation: mockAdmissionLocation,
      mutate: jest.fn(),
      error: undefined,
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
    mockedUseAdmissionLocation.mockReturnValueOnce({
      isLoading: false,
      isValidating: false,
      admissionLocation: {
        ...mockAdmissionLocation,
        totalBeds: 0,
        bedLayouts: [],
      },
      mutate: jest.fn(),
      error: null,
    });
    renderAdmissionForm();
    expect(screen.getByText('Select a bed')).toBeInTheDocument();
    expect(screen.getByText('No beds configured for Inpatient Ward location')).toBeInTheDocument();
  });

  it('should submit the form, create encounter and submit bed', async () => {
    mockedUseAdmissionLocation.mockReturnValueOnce({
      isLoading: false,
      isValidating: false,
      admissionLocation: mockAdmissionLocation,
      mutate: jest.fn(),
      error: null,
    });
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
    expect(mockedOpenmrsFetch).toHaveBeenCalledWith('undefined/encounter', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        patient: mockPatientAlice.uuid,
        encounterType: 'admission-encounter-type-uuid',
        location: mockAdmissionLocation.ward.uuid,
      },
    });
    expect(mockedOpenmrsFetch).toHaveBeenCalledWith('undefined/beds/3', {
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
      subtitle: '{{patientName}} has been successfully admitted to the bed bed3',
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
      title: 'Failed to create Admission Encounter encounter',
      subtitle: 'Failed to create encounter',
    });
  });

  it('should show warning snackbar if encounter was created and bed assignment was not successful', async () => {
    // @ts-ignore - matching whole FetchResponse type is not necessary
    mockedOpenmrsFetch.mockImplementation((url) => {
      if (url.startsWith('undefined/beds')) {
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
      subtitle: 'Patient admitted successfully but no bed was assigned to the patient',
    });
  });

  it('should admit patient if no beds are configured', async () => {
    mockedUseAdmissionLocation.mockReturnValueOnce({
      isLoading: false,
      isValidating: false,
      admissionLocation: {
        ...mockAdmissionLocation,
        totalBeds: 0,
        bedLayouts: [],
      },
      mutate: jest.fn(),
      error: null,
    });
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
    expect(mockedOpenmrsFetch).toHaveBeenCalledWith('undefined/encounter', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: {
        patient: mockPatientAlice.uuid,
        encounterType: 'admission-encounter-type-uuid',
        location: mockAdmissionLocation.ward.uuid,
      },
    });
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      subtitle: 'Patient admitted successfully to Inpatient Ward',
      title: 'Patient admitted successfully',
    });
  });
});
