import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtensionSlot, getDefaultsFromConfigSchema, useConfig, useVisit } from '@openmrs/esm-framework';
import { type SearchedPatient } from '../../../types';
import { configSchema, type PatientSearchConfig } from '../../../config-schema';
import { PatientSearchContext2, type PatientSearchContext2Props } from '../../../patient-search-context';
import PatientBanner from './patient-banner.component';

const mockUseConfig = vi.mocked(useConfig<PatientSearchConfig>);
const mockUseVisit = vi.mocked(useVisit);
const mockExtensionSlot = vi.mocked(ExtensionSlot);

const activeVisit = {
  encounters: [],
  startDatetime: new Date().toISOString(),
  uuid: 'mock-visit',
  visitType: { display: 'Some Visit Type', uuid: 'some-visit-type-uuid' },
  stopDatetime: null,
};

const noVisitState = {
  activeVisit: null,
  currentVisit: null,
  currentVisitIsRetrospective: null,
  mutate: vi.fn(),
  error: undefined,
  isLoading: false,
  isValidating: false,
};

const patient: SearchedPatient = {
  attributes: [],
  identifiers: [
    {
      display: 'OpenMRS ID = 1000NLY',
      uuid: '19e98c23-d26f-4668-8810-00da0e10e326',
      identifier: '1000NLY',
      identifierType: {
        uuid: '05a29f94-c0ed-11e2-94be-8c13b969e334',
        display: 'OpenMRS ID',
        links: [],
      },
      location: {
        uuid: '44c3efb0-2583-4c80-a79e-1f756a03c0a1',
        display: 'Outpatient Clinic',
      },
      preferred: true,
    },
  ],
  person: {
    age: 35,
    addresses: [],
    birthdate: '1990-01-01T00:00:00.000+0000',
    dead: false,
    deathDate: null,
    gender: 'M',
    personName: {
      display: 'Smith, John Doe',
      givenName: 'John',
      middleName: 'Doe',
      familyName: 'Smith',
    },
  },
  uuid: 'test-patient-uuid',
};

function makeContext2(contextOverrides: Partial<PatientSearchContext2Props> = {}): PatientSearchContext2Props {
  return {
    onPatientSelected: vi.fn(),
    launchChildWorkspace: vi.fn(),
    closeWorkspace: vi.fn(),
    startVisitWorkspaceName: 'start-visit-workspace',
    ...contextOverrides,
  };
}

function renderBanner(context: PatientSearchContext2Props) {
  render(
    <PatientSearchContext2.Provider value={context}>
      <PatientBanner patient={patient} patientUuid={patient.uuid} />
    </PatientSearchContext2.Provider>,
  );
}

describe('PatientBanner with a select patient button', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema));
    mockUseVisit.mockReturnValue(noVisitState);
    mockExtensionSlot.mockImplementation(({ name }) =>
      name === 'start-visit-button-slot2' ? <button>Start visit</button> : null,
    );
  });

  it('renders a disabled select button next to the start visit button when the patient has no active visit', () => {
    renderBanner(makeContext2({ selectPatientButton: { text: 'Admit', requiresActiveVisit: true } }));

    expect(screen.getByRole('button', { name: 'Admit' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Start visit' })).toBeInTheDocument();
  });

  it('renders an enabled select button and no start visit button when the patient has an active visit', async () => {
    const user = userEvent.setup();
    mockUseVisit.mockReturnValue({ ...noVisitState, activeVisit });

    const context = makeContext2({ selectPatientButton: { text: 'Admit', requiresActiveVisit: true } });
    renderBanner(context);

    const admitButton = screen.getByRole('button', { name: 'Admit' });
    expect(admitButton).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Start visit' })).not.toBeInTheDocument();

    await user.click(admitButton);
    expect(context.onPatientSelected).toHaveBeenCalledWith(
      patient.uuid,
      expect.objectContaining({ id: patient.uuid }),
      context.launchChildWorkspace,
      context.closeWorkspace,
    );
  });

  it('does not make the patient card clickable when a select button is configured', () => {
    renderBanner(makeContext2({ selectPatientButton: { text: 'Admit', requiresActiveVisit: true } }));

    expect(screen.queryByRole('button', { name: /patient banner patient info/i })).not.toBeInTheDocument();
  });

  it('keeps the patient card clickable when no select button is configured', async () => {
    const user = userEvent.setup();

    const context = makeContext2();
    renderBanner(context);

    expect(screen.queryByRole('button', { name: 'Admit' })).not.toBeInTheDocument();
    const cardButton = screen.getByRole('button', { name: /patient banner patient info/i });
    await user.click(cardButton);
    expect(context.onPatientSelected).toHaveBeenCalledWith(
      patient.uuid,
      expect.objectContaining({ id: patient.uuid }),
      context.launchChildWorkspace,
      context.closeWorkspace,
    );
  });
});
