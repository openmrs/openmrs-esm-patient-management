import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../../config-schema';
import { mockSession } from '__mocks__';
import { useActiveVisits } from '../../metrics/metrics.resource';
import { useQueueEntries } from '../../hooks/useQueueEntries';
import { useServiceQueuesStore } from '../../store/store';
import CheckedInPatients from './checked-in-patients.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUseSession = vi.mocked(useSession);

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
    identifiers: [{ identifier: '100ALICE', uuid: 'id-alice' }],
    person: { display: 'Alice Adams', age: 30, gender: 'F', uuid: 'person-alice' },
  },
};
const bob = {
  uuid: 'visit-bob',
  patient: {
    uuid: 'patient-bob',
    identifiers: [{ identifier: '100BOB', uuid: 'id-bob' }],
    person: { display: 'Bob Barker', age: 40, gender: 'M', uuid: 'person-bob' },
  },
};

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
    mockUseConfig.mockReturnValue({ ...getDefaultsFromConfigSchema(configSchema) });
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
    mockUseQueueEntries.mockReturnValue({ queueEntries: [], isLoading: false } as any);
  });

  it('lists checked-in patients who are not yet in a queue', () => {
    renderComponent();
    expect(screen.getByText('Alice Adams')).toBeInTheDocument();
    expect(screen.getByText('Bob Barker')).toBeInTheDocument();
    expect(screen.getByText(/100ALICE/)).toBeInTheDocument();
  });

  it('excludes patients who already have an active queue entry', () => {
    mockUseQueueEntries.mockReturnValue({
      queueEntries: [{ patient: { uuid: 'patient-bob' } }],
      isLoading: false,
    } as any);
    renderComponent();
    expect(screen.getByText('Alice Adams')).toBeInTheDocument();
    expect(screen.queryByText('Bob Barker')).not.toBeInTheDocument();
  });

  it('calls onPatientSelected with the patient uuid when a row is clicked', async () => {
    const user = userEvent.setup();
    const { onPatientSelected, launchChildWorkspace, closeWorkspace } = renderComponent();
    await user.click(screen.getByText('Alice Adams'));
    expect(onPatientSelected).toHaveBeenCalledWith(
      'patient-alice',
      { id: 'patient-alice' },
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

  it('renders nothing when the config flag is disabled', () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      showRecentlyCheckedInPatientsBeforeSearch: false,
    });
    const { container } = render(
      <CheckedInPatients onPatientSelected={vi.fn()} launchChildWorkspace={vi.fn()} closeWorkspace={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
