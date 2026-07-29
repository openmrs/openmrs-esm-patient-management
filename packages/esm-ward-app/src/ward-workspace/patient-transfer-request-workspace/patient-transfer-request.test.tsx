/**
 * @vitest-environment jsdom
 *
 * The form-submit flow under test does not fire its callback under happy-dom
 * (likely a DOM-event-dispatch divergence). Run this file under jsdom.
 */
import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAppContext } from '@openmrs/esm-framework';
import {
  emrConfigurationMock,
  mockInpatientRequestAlice,
  mockLocationInpatientWard,
  mockLocationMosoriot,
  mockPatientAlice,
  mockPatientBrian,
} from '__mocks__';
import { renderWithSwr } from 'tools';
import { mockWardViewContext } from '../../../mock';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import useLocations from '../../hooks/useLocations';
import useWardLocation from '../../hooks/useWardLocation';
import type { DispositionType, WardPatient, WardViewContext } from '../../types';
import { useCreateEncounter } from '../../ward.resource';
import PatientTransferRequestWorkspace from './patient-transfer-request.workspace';

vi.mock('../../hooks/useWardLocation', () => ({ default: vi.fn() }));
vi.mock('../../hooks/useEmrConfiguration', () => ({ default: vi.fn() }));
vi.mock('../../hooks/useLocations', () => ({ default: vi.fn() }));
vi.mock('../../hooks/useInpatientRequest', () => ({ useInpatientRequest: vi.fn() }));
vi.mock('../../hooks/useInpatientAdmission', () => ({ useInpatientAdmission: vi.fn() }));
vi.mock('../../hooks/useWardPatientGrouping', () => ({ useWardPatientGrouping: vi.fn() }));
vi.mock('../../ward.resource', () => ({ useCreateEncounter: vi.fn() }));

const mockedCreateEncounter = vi.fn().mockResolvedValue({ ok: true, data: { uuid: 'encounter-uuid' } });

vi.mocked(useCreateEncounter).mockReturnValue({
  createEncounter: mockedCreateEncounter,
  emrConfiguration: emrConfigurationMock,
  isLoadingEmrConfiguration: false,
  errorFetchingEmrConfiguration: false,
});

vi.mocked(useEmrConfiguration).mockReturnValue({
  emrConfiguration: emrConfigurationMock,
  isLoadingEmrConfiguration: false,
  errorFetchingEmrConfiguration: null,
  mutateEmrConfiguration: vi.fn(),
});

vi.mocked(useWardLocation).mockReturnValue({
  location: mockLocationInpatientWard,
  invalidLocation: false,
  isLoadingLocation: false,
  errorFetchingLocation: null,
});

// @ts-ignore - the form only reads `data` off the pagination result
vi.mocked(useLocations).mockReturnValue({
  data: [{ id: mockLocationMosoriot.uuid, name: mockLocationMosoriot.name }],
  isLoading: false,
  totalCount: 1,
  currentPage: 1,
  totalPages: 1,
  goToNext: vi.fn(),
  goToPrevious: vi.fn(),
});

vi.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

function makeWardPatient(
  dispositionType: DispositionType,
  patient = mockPatientAlice,
  disposition = mockInpatientRequestAlice.disposition,
): WardPatient {
  return {
    visit: mockInpatientRequestAlice.visit,
    patient,
    bed: null,
    inpatientAdmission: null,
    inpatientRequest: { ...mockInpatientRequestAlice, patient, dispositionType, disposition },
  };
}

function renderPatientTransferRequestWorkspace(
  dispositionType: DispositionType,
  relatedTransferPatients?: WardPatient[],
) {
  renderWithSwr(
    <PatientTransferRequestWorkspace
      launchChildWorkspace={vi.fn()}
      closeWorkspace={vi.fn()}
      workspaceProps={{ wardPatient: makeWardPatient(dispositionType), relatedTransferPatients }}
      windowProps={undefined}
      groupProps={undefined}
      workspaceName={''}
      windowName={''}
      isRootWorkspace={false}
    />,
  );
}

async function selectLocationAndSubmit() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('radio', { name: mockLocationMosoriot.name }));
  await user.click(screen.getByRole('button', { name: /save/i }));
}

const { admissionLocationConcept, internalTransferLocationConcept, dispositionConcept, dispositionSetConcept } =
  emrConfigurationMock.dispositionDescriptor;
const admitDisposition = emrConfigurationMock.dispositions.find(({ type }) => type === 'ADMIT');
const transferDisposition = emrConfigurationMock.dispositions.find(({ type }) => type === 'TRANSFER');

describe('PatientTransferRequestWorkspace', () => {
  beforeEach(() => {
    mockedCreateEncounter.mockClear();
  });

  it('creates an admission request when handling a pending admission request', async () => {
    renderPatientTransferRequestWorkspace('ADMIT');

    expect(screen.getByRole('heading', { name: /admit elsewhere/i })).toBeInTheDocument();

    await selectLocationAndSubmit();

    expect(mockedCreateEncounter).toHaveBeenCalledWith(
      mockPatientAlice,
      emrConfigurationMock.transferRequestEncounterType,
      mockInpatientRequestAlice.visit.uuid,
      [
        {
          concept: dispositionSetConcept.uuid,
          groupMembers: [
            { concept: admissionLocationConcept.uuid, value: mockLocationMosoriot.uuid },
            { concept: dispositionConcept.uuid, value: admitDisposition.conceptCode },
          ],
        },
      ],
    );
  });

  it('creates a transfer request when handling a pending transfer request', async () => {
    renderPatientTransferRequestWorkspace('TRANSFER');

    expect(screen.getByRole('heading', { name: /transfer elsewhere/i })).toBeInTheDocument();

    await selectLocationAndSubmit();

    expect(mockedCreateEncounter).toHaveBeenCalledWith(
      mockPatientAlice,
      emrConfigurationMock.transferRequestEncounterType,
      mockInpatientRequestAlice.visit.uuid,
      [
        {
          concept: dispositionSetConcept.uuid,
          groupMembers: [
            { concept: internalTransferLocationConcept.uuid, value: mockLocationMosoriot.uuid },
            { concept: dispositionConcept.uuid, value: transferDisposition.conceptCode },
          ],
        },
      ],
    );
  });

  it('keeps each related patient on their own request type', async () => {
    // A mother awaiting admission can have a child awaiting transfer; the child must stay a
    // transfer request rather than inheriting the mother's admission request.
    const relatedTransferPatient = makeWardPatient('TRANSFER', mockPatientBrian);
    renderPatientTransferRequestWorkspace('ADMIT', [relatedTransferPatient]);

    await selectLocationAndSubmit();

    expect(mockedCreateEncounter).toHaveBeenCalledTimes(2);

    const payloadFor = (patientUuid: string) =>
      mockedCreateEncounter.mock.calls.find(([patient]) => patient.uuid === patientUuid)?.[3][0].groupMembers;

    expect(payloadFor(mockPatientAlice.uuid)).toEqual([
      { concept: admissionLocationConcept.uuid, value: mockLocationMosoriot.uuid },
      { concept: dispositionConcept.uuid, value: admitDisposition.conceptCode },
    ]);
    expect(payloadFor(mockPatientBrian.uuid)).toEqual([
      { concept: internalTransferLocationConcept.uuid, value: mockLocationMosoriot.uuid },
      { concept: dispositionConcept.uuid, value: relatedTransferPatient.inpatientRequest.disposition.uuid },
    ]);
  });

  it('preserves the specific disposition a related pending request was created with', async () => {
    // An implementation can configure several dispositions per type, so a related patient must
    // keep the disposition their own request used rather than the first one configured for it.
    const secondTransferDisposition = {
      ...mockInpatientRequestAlice.disposition,
      uuid: 'second-transfer-concept-uuid',
    };
    const relatedTransferPatient = makeWardPatient('TRANSFER', mockPatientBrian, secondTransferDisposition);
    renderPatientTransferRequestWorkspace('ADMIT', [relatedTransferPatient]);

    await selectLocationAndSubmit();

    const payloadFor = (patientUuid: string) =>
      mockedCreateEncounter.mock.calls.find(([patient]) => patient.uuid === patientUuid)?.[3][0].groupMembers;

    expect(payloadFor(mockPatientBrian.uuid)).toEqual([
      { concept: internalTransferLocationConcept.uuid, value: mockLocationMosoriot.uuid },
      { concept: dispositionConcept.uuid, value: 'second-transfer-concept-uuid' },
    ]);
  });
});
