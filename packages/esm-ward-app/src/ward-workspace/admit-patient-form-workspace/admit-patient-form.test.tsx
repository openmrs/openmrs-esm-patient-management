import {
  CloseWorkspaceOptions,
  type DefaultWorkspaceProps,
  showSnackbar,
  useAppContext,
  useFeatureFlag,
  useSession,
} from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { mockInpatientRequestAlice, mockLocationInpatientWard, mockPatientAlice } from '../../../../../__mocks__';
import { renderWithSwr } from '../../../../../tools';
import { mockWardPatientGroupDetails, mockWardViewContext } from '../../../mock';
import { useAssignedBedByPatient } from '../../hooks/useAssignedBedByPatient';
import useWardLocation from '../../hooks/useWardLocation';
import type { DispositionType, WardPatient, WardViewContext } from '../../types';
import { assignPatientToBed, removePatientFromBed, useAdmitPatient } from '../../ward.resource';
import AdmitPatientFormWorkspace from './admit-patient-form.workspace';

jest.mock('../../hooks/useAdmissionLocation', () => ({
  useAdmissionLocation: jest.fn(),
}));

jest.mock('../../hooks/useWardLocation', () => jest.fn());

jest.mock('../../hooks/useInpatientRequest', () => ({
  useInpatientRequest: jest.fn(),
}));

jest.mock('../../hooks/useWardPatientGrouping', () => ({
  useWardPatientGrouping: jest.fn(),
}));

jest.mock('../../hooks/useInpatientAdmission', () => ({
  useInpatientAdmission: jest.fn(),
}));

jest.mock('../../hooks/useAssignedBedByPatient', () => ({
  useAssignedBedByPatient: jest.fn(),
}));

jest.mock('../../ward.resource', () => ({
  useAdmitPatient: jest.fn(),
  assignPatientToBed: jest.fn(),
  removePatientFromBed: jest.fn(),
}));

const mockedUseWardLocation = jest.mocked(useWardLocation);
const mockedUseFeatureFlag = jest.mocked(useFeatureFlag);
const mockedShowSnackbar = jest.mocked(showSnackbar);
const mockedUseSession = jest.mocked(useSession);
const mockedUseAssignedBedByPatient = jest.mocked(useAssignedBedByPatient);
const mockedAssignPatientToBed = jest.mocked(assignPatientToBed);
const mockedRemovePatientFromBed = jest.mocked(removePatientFromBed);
const mockedUseAdmitPatient = jest.mocked(useAdmitPatient);

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

const mockedAdmitPatient = jest.fn();
const mockUseAdmitPatientObj: ReturnType<typeof useAdmitPatient> = {
  admitPatient: mockedAdmitPatient,
  isLoadingEmrConfiguration: false,
  errorFetchingEmrConfiguration: false,
};
jest.mocked(useAdmitPatient).mockReturnValue(mockUseAdmitPatientObj);

const mockWorkspaceProps: DefaultWorkspaceProps = {
  closeWorkspaceWithSavedChanges: jest.fn(),
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
  closeWorkspace: jest.fn(),
};

const mockWardPatientAliceProps: WardPatient = {
  visit: mockInpatientRequestAlice.visit,
  patient: mockPatientAlice,
  bed: null,
  inpatientAdmission: null,
  inpatientRequest: mockInpatientRequestAlice,
};

function renderAdmissionForm() {
  renderWithSwr(
    <AdmitPatientFormWorkspace
      {...{ ...mockWorkspaceProps, wardPatient: mockWardPatientAliceProps, WardPatientHeader: jest.fn() }}
    />,
  );
}

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

    mockedUseWardLocation.mockReturnValue({
      location: mockLocationInpatientWard,
      invalidLocation: false,
      isLoadingLocation: false,
      errorFetchingLocation: null,
    });

    // @ts-ignore - we don't need to mock the entire object
    mockedUseAssignedBedByPatient.mockReturnValue({
      data: {
        data: {
          results: [
            {
              bedId: 1,
              bedNumber: 1,
              bedType: null,
              patients: [mockPatientAlice],
              physicalLocation: mockLocationInpatientWard,
            },
          ],
        },
      },
    });

    // @ts-ignore - we only need these two keys for now
    mockedAdmitPatient.mockResolvedValue({
      ok: true,
      data: {
        uuid: 'encounter-uuid',
      },
    });

    // @ts-ignore - we only need the ok key for now
    mockedAssignPatientToBed.mockResolvedValue({
      ok: true,
    });

    // @ts-ignore - we only need the ok key for now
    mockedRemovePatientFromBed.mockResolvedValue({
      ok: true,
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

    expect(screen.getByRole('radio', { name: 'bed1 · Alice Johnson' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'bed2 · Empty' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'bed3 · Empty' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'bed4 · Empty' })).toBeInTheDocument();
  });

  it('should block the form if emr configuration is not fetched properly', () => {
    mockedUseAdmitPatient.mockReturnValueOnce({
      admitPatient: mockedAdmitPatient,
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: true,
    });

    renderAdmissionForm();

    const admitButton = screen.getByText('Admit');
    expect(admitButton).toBeDisabled();
  });

  it('should render admit patient form if bed management module is present, but no beds are configured', () => {
    mockedUseFeatureFlag.mockReturnValue(true);
    const replacedProperty = jest.replaceProperty(mockWardPatientGroupDetails(), 'bedLayouts', []);
    renderAdmissionForm();
    expect(screen.getByText('Select a bed')).toBeInTheDocument();
    expect(screen.getByText(/No beds configured/i)).toBeInTheDocument();
    replacedProperty.restore();
  });

  it('should submit the form, create encounter and submit bed', async () => {
    const user = userEvent.setup();
    renderAdmissionForm();
    const bedOption = screen.getByRole('radio', { name: 'bed3 · Empty' });
    await user.click(bedOption);
    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    await user.click(admitButton);
    expect(mockedAdmitPatient).toHaveBeenCalledWith(mockPatientAlice, 'ADMIT');
    expect(mockedAssignPatientToBed).toHaveBeenCalledWith(3, mockPatientAlice.uuid, 'encounter-uuid');
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      subtitle: '{{patientName}} has been successfully admitted and assigned to bed bed3',
      title: 'Patient admitted successfully',
    });
  });

  it('should show snackbar if there was an issue creating an encounter', async () => {
    mockedAdmitPatient.mockRejectedValue(new Error('Failed to create encounter'));
    const user = userEvent.setup();
    renderAdmissionForm();
    const bedOption = screen.getByRole('radio', { name: 'bed3 · Empty' });
    await user.click(bedOption);
    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    await user.click(admitButton);
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'error',
      title: 'Failed to admit patient',
      subtitle: 'Failed to create encounter',
    });
  });

  it('should show warning snackbar if encounter was created and bed assignment was not successful', async () => {
    mockedAssignPatientToBed.mockRejectedValue(new Error('Failed to assign bed'));

    const user = userEvent.setup();
    renderAdmissionForm();
    const bedOption = screen.getByRole('radio', { name: 'bed3 · Empty' });
    await user.click(bedOption);
    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    await user.click(admitButton);
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'warning',
      title: 'Patient admitted successfully',
      subtitle: 'Patient admitted successfully but fail to assign bed to patient',
    });
  });

  it('should admit patient if no bed is selected', async () => {
    const user = userEvent.setup();
    renderAdmissionForm();
    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    await user.click(admitButton);
    expect(mockedAdmitPatient).toHaveBeenCalledWith(mockPatientAlice, 'ADMIT');
    expect(mockedRemovePatientFromBed).toHaveBeenCalledWith(1, mockPatientAlice.uuid);
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      kind: 'success',
      subtitle: 'Patient admitted successfully to Inpatient Ward',
      title: 'Patient admitted successfully',
    });
  });
});
