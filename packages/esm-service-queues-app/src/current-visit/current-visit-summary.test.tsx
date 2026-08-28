import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtensionSlot, launchWorkspace2, usePatient } from '@openmrs/esm-framework';
import { mockPastVisit } from '__mocks__';
import { mockPatient } from 'tools';
import {
  serviceQueuesPatientFormEntryWorkspace,
  serviceQueuesPatientVitalsWorkspace,
  serviceQueuesVisitNotesWorkspace,
} from '../constants';
import { useVisit } from './current-visit.resource';
import CurrentVisit from './current-visit-summary.component';

const mockUseVisit = vi.mocked(useVisit);
const mockUsePatient = vi.mocked(usePatient);
const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

vi.mock('./current-visit.resource', () => ({
  useVisit: vi.fn(),
}));

const patientUuid = mockPastVisit.data.results[0].patient.uuid;
const visitUuid = mockPastVisit.data.results[0].uuid;
const visit = { visitType: { display: 'Visit Type' }, encounters: [] };

const vitalsSlotName = 'service-queues-current-visit-vitals-slot';
const visitSummarySlotName = 'service-queues-visit-summary-slot';

const getSlotState = (slotName: string) =>
  mockExtensionSlot.mock.calls.map(([props]) => props).find(({ name }) => name === slotName)?.state;

describe('CurrentVisit', () => {
  beforeEach(() => {
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      patientUuid,
      isLoading: false,
      error: null,
    });
    mockUseVisit.mockReturnValue({
      visit: visit as any,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  it('renders visit details correctly', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Visit Type')).toBeInTheDocument();
    expect(screen.getByText('Scheduled for today')).toBeInTheDocument();
    expect(screen.getByText('On time')).toBeInTheDocument();
  });

  it('mounts the vitals and visit-summary slots and wires the vitals form launcher', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(getSlotState(visitSummarySlotName)).toMatchObject({
      visit,
      patientUuid,
      patient: mockPatient,
      onEditEncounter: expect.any(Function),
      mutateVisitContext: expect.any(Function),
    });

    const vitalsState = getSlotState(vitalsSlotName) as { launchCustomVitalsForm: () => void };
    vitalsState.launchCustomVitalsForm();
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      serviceQueuesPatientVitalsWorkspace,
      expect.objectContaining({ patientUuid, visitContext: visit }),
    );
  });

  it('edits encounters through the queues-owned workspaces rather than the chart-group ones', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    const { onEditEncounter } = getSlotState(visitSummarySlotName) as {
      onEditEncounter: (encounter: { id: string; form?: unknown }, isVisitNote: boolean) => void;
    };

    // The notes form keys "editing" off the encounter it is handed, so it has to arrive unchanged.
    const noteEncounter = { id: 'encounter-1', rawDatetime: '2026-08-12T10:00:00.000+0000' };
    onEditEncounter(noteEncounter, true);
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      serviceQueuesVisitNotesWorkspace,
      expect.objectContaining({ encounter: noteEncounter, formContext: 'editing', patientUuid, visitContext: visit }),
    );

    const form = { uuid: 'form-1' };
    onEditEncounter({ id: 'encounter-2', form }, false);
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      serviceQueuesPatientFormEntryWorkspace,
      { form, encounterUuid: 'encounter-2' },
      // The exported form entry workspace reads the patient context from window props, not workspace props.
      expect.objectContaining({ patientUuid, visitContext: visit }),
    );
  });

  it('launches the visit notes workspace from the visit note form button', async () => {
    const user = userEvent.setup();
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    await user.click(screen.getByRole('button', { name: /visit note form/i }));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(serviceQueuesVisitNotesWorkspace, {
      formContext: 'creating',
      patientUuid,
      patient: mockPatient,
      visitContext: visit,
    });
  });

  it('defers the vitals extension and visit note form until the patient has loaded', async () => {
    mockUsePatient.mockReturnValue({
      patient: null,
      patientUuid,
      isLoading: true,
      error: null,
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByRole('button', { name: /visit note form/i })).toBeDisabled();
    // The vitals extension reads `patient` during render, so mounting it early throws into its
    // error boundary. The visit summary only needs the visit, so it still mounts.
    expect(getSlotState(vitalsSlotName)).toBeUndefined();
    expect(getSlotState(visitSummarySlotName)).toMatchObject({ visit, patientUuid });
  });

  it('renders a loading skeleton when fetching data', async () => {
    mockUseVisit.mockReturnValue({
      visit: null,
      error: null,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a fallback when visit uuid is missing', async () => {
    mockUseVisit.mockReturnValue({
      visit: null,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<CurrentVisit patientUuid={patientUuid} />);

    expect(mockUseVisit).toHaveBeenCalledWith(undefined);
    expect(screen.getByText('No active visit')).toBeInTheDocument();
  });

  it('renders a fallback when visit data is unavailable', async () => {
    mockUseVisit.mockReturnValue({
      visit: null,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByText('No active visit')).toBeInTheDocument();
  });
});
