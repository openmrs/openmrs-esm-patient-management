/**
 * @vitest-environment jsdom
 *
 * The form-submit flow under test does not fire its callback under happy-dom
 * (likely a DOM-event-dispatch divergence). Run this file under jsdom.
 */
import React from 'react';
import { vi, describe, it, expect } from 'vitest';
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

vi.mock('../../hooks/useWardLocation', () => ({ default: vi.fn() }));

vi.mock('../../hooks/useInpatientRequest', () => ({
  useInpatientRequest: vi.fn(),
}));

vi.mock('../../hooks/useWardPatientGrouping', () => ({
  useWardPatientGrouping: vi.fn(),
}));

vi.mock('../../hooks/useInpatientAdmission', () => ({
  useInpatientAdmission: vi.fn(),
}));

vi.mock('../../ward.resource', () => ({
  useCreateEncounter: vi.fn(),
}));

const mockedUseWardLocation = vi.mocked(useWardLocation);
const mockedCreateEncounter = vi.fn().mockResolvedValue({
  ok: true,
  data: {
    uuid: 'encounter-uuid',
  },
});
const mockedUseCreateEncounter = vi.mocked(useCreateEncounter);
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

const mockWardPatientAlice: WardPatient = {
  visit: mockInpatientRequestAlice.visit,
  patient: mockPatientAlice,
  bed: null,
  inpatientAdmission: null,
  inpatientRequest: mockInpatientRequestAlice,
};

vi.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

function renderCancelAdmissionRequestWorkspace() {
  renderWithSwr(
    <CancelAdmissionRequestWorkspace
      launchChildWorkspace={vi.fn()}
      closeWorkspace={vi.fn()}
      workspaceProps={{
        wardPatient: mockWardPatientAlice,
      }}
      windowProps={undefined}
      groupProps={undefined}
      workspaceName={''}
      windowName={''}
      isRootWorkspace={false}
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
