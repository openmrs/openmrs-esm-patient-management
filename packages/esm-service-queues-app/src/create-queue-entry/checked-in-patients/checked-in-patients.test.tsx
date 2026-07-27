import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import {
  PatientBannerContactDetails,
  PatientBannerPatientInfo,
  PatientBannerToggleContactDetailsButton,
  useSession,
} from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { useActiveVisits } from '../../metrics/metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import { useServiceQueuesStore } from '../../store/store';
import CheckedInPatients from './checked-in-patients.component';

const mockUseSession = vi.mocked(useSession);
const mockPatientBannerPatientInfo = vi.mocked(PatientBannerPatientInfo);
const mockPatientBannerContactDetails = vi.mocked(PatientBannerContactDetails);
const mockToggleContactDetailsButton = vi.mocked(PatientBannerToggleContactDetailsButton);

vi.mock('../../metrics/metrics.resource', () => ({
  useActiveVisits: vi.fn(),
}));

vi.mock('../../hooks/useQueueEntries', () => ({
  useQueueEntries: vi.fn(),
}));

vi.mock('../../store/store', () => ({
  useServiceQueuesStore: vi.fn(),
}));

const mockUseActiveVisits = vi.mocked(useActiveVisits);
const mockUseQueueEntries = vi.mocked(useQueueEntries);
const mockUseServiceQueuesStore = vi.mocked(useServiceQueuesStore);

const alice = {
  uuid: 'visit-alice',
  patient: {
    uuid: 'patient-alice',
    identifiers: [{ identifier: '100ALICE', uuid: 'id-alice', identifierType: { uuid: 'type-1', name: 'OpenMRS ID' } }],
    person: {
      display: 'Alice Adams',
      age: 30,
      gender: 'F',
      uuid: 'person-alice',
      birthdate: '1994-01-01',
      preferredName: { givenName: 'Alice', familyName: 'Adams' },
      dead: false,
      deathDate: null,
    },
  },
};
const bob = {
  uuid: 'visit-bob',
  patient: {
    uuid: 'patient-bob',
    identifiers: [{ identifier: '100BOB', uuid: 'id-bob', identifierType: { uuid: 'type-1', name: 'OpenMRS ID' } }],
    person: {
      display: 'Bob Barker',
      age: 40,
      gender: 'M',
      uuid: 'person-bob',
      birthdate: '1984-01-01',
      preferredName: { givenName: 'Bob', familyName: 'Barker' },
      dead: false,
      deathDate: null,
    },
  },
};

/** UUIDs of the patients passed to the (mocked) patient-banner component, in render order. */
function renderedPatientUuids() {
  return mockPatientBannerPatientInfo.mock.calls.map((call) => call[0].patient.id);
}

function renderComponent(props = {}) {
  const defaultProps = {
    onPatientSelected: vi.fn(),
    launchChildWorkspace: vi.fn(),
    closeWorkspace: vi.fn(),
  };
  const merged = { ...defaultProps, ...props };
  render(<CheckedInPatients {...merged} />);
  return merged;
}

describe('CheckedInPatients', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue(mockSession.data);
    mockUseServiceQueuesStore.mockReturnValue({
      selectedQueueLocationUuid: 'location-1',
      selectedQueueStatusDisplay: '',
    });
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [alice, bob],
      activeVisitsCount: 2,
      isLoading: false,
      error: undefined,
      isValidating: false,
    } as any);
    mockUseQueueEntries.mockReturnValue({ queueEntries: [], isLoading: false, error: undefined } as any);
    // The framework mock renders a non-interactive div; make it a real button wired to the toggle
    // callback so the contact-details toggle can be exercised.
    mockToggleContactDetailsButton.mockImplementation(({ toggleContactDetails }: any) => (
      <button type="button" onClick={toggleContactDetails}>
        Toggle contact details
      </button>
    ));
  });

  it('lists checked-in patients who are not yet in a queue', () => {
    renderComponent();
    expect(renderedPatientUuids()).toEqual(['patient-alice', 'patient-bob']);
  });

  it('excludes patients who already have an active queue entry', () => {
    mockUseQueueEntries.mockReturnValue({
      queueEntries: [{ patient: { uuid: 'patient-bob' } }],
      isLoading: false,
    } as any);
    renderComponent();
    expect(renderedPatientUuids()).toEqual(['patient-alice']);
  });

  it('maps active-visit patient data into the fhir patient passed to the banner', () => {
    renderComponent();
    const [{ patient }] = mockPatientBannerPatientInfo.mock.calls[0];
    expect(patient).toMatchObject({
      id: 'patient-alice',
      gender: 'female',
      birthDate: '1994-01-01',
      name: [{ family: 'Adams', given: ['Alice'], text: 'Alice Adams' }],
      identifier: [{ value: '100ALICE', type: { text: 'OpenMRS ID', coding: [{ code: 'type-1' }] } }],
    });
  });

  it('calls onPatientSelected with the patient uuid when a row is clicked', async () => {
    const user = userEvent.setup();
    const { onPatientSelected, launchChildWorkspace, closeWorkspace } = renderComponent();
    const [firstRow] = screen.getAllByRole('listitem');
    // The first button in a row is the selection button (the second is the contact-details toggle).
    await user.click(within(firstRow).getAllByRole('button')[0]);
    expect(onPatientSelected).toHaveBeenCalledWith(
      'patient-alice',
      expect.objectContaining({ id: 'patient-alice' }),
      launchChildWorkspace,
      closeWorkspace,
    );
  });

  it('shows an empty message when there are no eligible patients', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [],
      activeVisitsCount: 0,
      isLoading: false,
      error: undefined,
      isValidating: false,
    } as any);
    renderComponent();
    expect(screen.getByText(/no checked-in patients/i)).toBeInTheDocument();
  });

  it('fetches active visits for the selected queue location', () => {
    renderComponent();
    expect(mockUseActiveVisits).toHaveBeenCalledWith('location-1');
  });

  it('falls back to the session location when no queue location is selected', () => {
    mockUseServiceQueuesStore.mockReturnValue({ selectedQueueLocationUuid: undefined, selectedQueueStatusDisplay: '' });
    renderComponent();
    expect(mockUseActiveVisits).toHaveBeenCalledWith(mockSession.data.sessionLocation.uuid);
  });

  it('renders a loading skeleton and no empty message while loading', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [],
      activeVisitsCount: 0,
      isLoading: true,
      error: undefined,
      isValidating: false,
    } as any);
    renderComponent();
    expect(screen.getByTestId('checked-in-patients-loading-skeleton')).toBeInTheDocument();
    expect(screen.queryByText(/no checked-in patients/i)).not.toBeInTheDocument();
  });

  it('shows an error state instead of the empty message when the visits fetch fails', () => {
    mockUseActiveVisits.mockReturnValue({
      activeVisits: [],
      activeVisitsCount: 0,
      isLoading: false,
      error: new Error('boom'),
      isValidating: false,
    } as any);
    renderComponent();
    expect(screen.getByText('Error State')).toBeInTheDocument();
    expect(screen.queryByText(/no checked-in patients/i)).not.toBeInTheDocument();
  });

  it('shows an error state when the queue-entries fetch fails', () => {
    mockUseQueueEntries.mockReturnValue({ queueEntries: [], isLoading: false, error: new Error('boom') } as any);
    renderComponent();
    expect(screen.getByText('Error State')).toBeInTheDocument();
  });

  it('reveals a row’s contact details when its toggle is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();
    expect(mockPatientBannerContactDetails).not.toHaveBeenCalled();

    const [firstRow] = screen.getAllByRole('listitem');
    await user.click(within(firstRow).getByRole('button', { name: /toggle contact details/i }));

    const lastCall = mockPatientBannerContactDetails.mock.calls.at(-1);
    expect(lastCall?.[0]).toMatchObject({ patientId: 'patient-alice', deceased: false });
  });
});
