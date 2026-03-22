import React from 'react';
import { render, screen } from '@testing-library/react';
import { emrConfigurationMock } from '__mocks__';
import { getDefaultsFromConfigSchema, useConfig, useEmrConfiguration } from '@openmrs/esm-framework';
import { configSchema, type WardConfigObject } from '../../../config-schema';
import { type PatientNote } from '../types';
import { usePatientNotes } from '../notes.resource';
import PatientNotesHistory from './notes-container.component';

const mockUseConfig = jest.mocked(useConfig<WardConfigObject>);

const mockedUseEmrConfiguration = jest.mocked(useEmrConfiguration);
const mockedUsePatientNotes = jest.mocked(usePatientNotes);

jest.mock('../notes.resource', () => ({
  usePatientNotes: jest.fn(),
}));

const mockPatientUuid = 'sample-patient-uuid';

const mockPatientNotes: PatientNote[] = [
  {
    encounterUuid: 'note-1',
    encounterNote: 'Patient shows improvement with current medication.',
    encounterNoteRecordedAt: '2024-08-01T12:34:56Z',
    encounterProvider: 'Dr. John Doe',
    obsUuid: 'obsUuid1',
    conceptUuid: 'concept1',
    encounterTypeUuid: 'inpatientNoteEncounterTypeUuid',
  },
  {
    encounterUuid: 'note-2',
    encounterNote: 'Blood pressure is slightly elevated. Consider adjusting medication.',
    encounterNoteRecordedAt: '2024-08-02T14:22:00Z',
    encounterProvider: 'Dr. Jane Smith',
    obsUuid: 'obsUuid2',
    conceptUuid: 'concept1',
    encounterTypeUuid: 'inpatientNoteEncounterTypeUuid',
  },
];

describe('PatientNotesHistory', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema<WardConfigObject>(configSchema));
  });

  test('displays loading skeletons when loading', () => {
    mockedUseEmrConfiguration.mockReturnValue({
      emrConfiguration: emrConfigurationMock,
      mutateEmrConfiguration: jest.fn(),
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });

    mockedUsePatientNotes.mockReturnValue({
      patientNotes: [],
      isLoadingPatientNotes: true,
      errorFetchingPatientNotes: undefined,
      mutatePatientNotes: jest.fn(),
    });

    render(<PatientNotesHistory patientUuid={mockPatientUuid} promptBeforeClosing={jest.fn()} visitUuid={''} />);

    expect(screen.getAllByTestId('in-patient-note-skeleton')).toHaveLength(4);
  });

  test('displays patient notes when available', () => {
    mockedUseEmrConfiguration.mockReturnValue({
      emrConfiguration: emrConfigurationMock,
      mutateEmrConfiguration: jest.fn(),
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });

    mockedUsePatientNotes.mockReturnValue({
      patientNotes: mockPatientNotes,
      isLoadingPatientNotes: false,
      errorFetchingPatientNotes: undefined,
      mutatePatientNotes: jest.fn(),
    });

    render(<PatientNotesHistory patientUuid={mockPatientUuid} promptBeforeClosing={jest.fn()} visitUuid={''} />);

    expect(screen.getByText('History')).toBeInTheDocument();

    expect(screen.getByText('Patient shows improvement with current medication.')).toBeInTheDocument();
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
    expect(screen.getByText('Blood pressure is slightly elevated. Consider adjusting medication.')).toBeInTheDocument();
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
  });
});
