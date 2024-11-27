import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppContext, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { mockInpatientRequestAlice, mockLocationInpatientWard, mockPatientAlice } from '__mocks__';
import { renderWithSwr } from 'tools';
import useWardLocation from '../../hooks/useWardLocation';
import type { WardPatient, WardViewContext } from '../../types';
import { useCreateEncounter } from '../../ward.resource';
import CancelAdmissionRequestWorkspace from './cancel-admission-request.workspace';
import { mockWardViewContext } from '../../../mock';

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

jest.mock('../../ward.resource', () => ({
  useCreateEncounter: jest.fn(),
}));

const mockedUseWardLocation = jest.mocked(useWardLocation);
const mockedCreateEncounter = jest.fn().mockResolvedValue({
  ok: true,
  data: {
    uuid: 'encounter-uuid',
  },
});
const mockedUseCreateEncounter = jest.mocked(useCreateEncounter);
mockedUseCreateEncounter.mockReturnValue({
  createEncounter: mockedCreateEncounter,
  isLoadingEmrConfiguration: false,
  errorFetchingEmrConfiguration: false,
  emrConfiguration: null,
});

mockedUseWardLocation.mockReturnValue({
  location: mockLocationInpatientWard,
  invalidLocation: false,
  isLoadingLocation: false,
  errorFetchingLocation: null,
});

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

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

function renderCancelAdmissionRequestWorkspace() {
  renderWithSwr(
    <CancelAdmissionRequestWorkspace
      {...{ ...mockWorkspaceProps, wardPatient: mockWardPatientAliceProps, WardPatientHeader: jest.fn() }}
    />,
  );
}

describe('CancelAdmissionRequestWorkspace', () => {
  it('should cancel admission request form creates encounter when form is filled out and submitted ', async () => {
    const user = userEvent.setup();
    renderCancelAdmissionRequestWorkspace();

    const textbox = screen.getByRole('textbox');
    expect(textbox).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: /save/i });
    await user.click(submit);

    const warningText = /notes required for cancelling admission or transfer request/i;
    const warning = screen.getByText(warningText);
    expect(warning).toBeInTheDocument();

    await user.type(textbox, 'Test note');
    expect(screen.queryByText(warningText)).not.toBeInTheDocument();

    await user.click(submit);

    expect(mockedCreateEncounter).toHaveBeenCalled();
  });
});
