import React from 'react';
import { render, screen } from '@testing-library/react';
import { emrConfigurationMock } from '__mocks__';
import { useEmrConfiguration } from '@openmrs/esm-framework';
import { type PatientNote } from '../types';
import PatientNotesHistory from './notes-container.component';

const mockedUseEmrConfiguration = jest.mocked(useEmrConfiguration);

const mockPatientNotes: PatientNote[] = [
  {
    encounterUuid: 'note-1',
    encounterNote: 'Patient shows improvement with current medication.',
    encounterNoteRecordedAt: '2024-08-01T12:34:56Z',
    encounterProvider: 'Dr. John Doe',
    obsUuid: 'obsUuid1',
    conceptUuid: 'concept1',
    encounterTypeUuid: 'inpatientNoteEncounterTypeUuid',
    isEdited: false,
    lastEditedBy: '',
    lastEditedAt: '2024-08-01T12:34:56Z',
    editHistory: [],
  },
  {
    encounterUuid: 'note-2',
    encounterNote: 'Blood pressure is slightly elevated. Consider adjusting medication.',
    encounterNoteRecordedAt: '2024-08-02T14:22:00Z',
    encounterProvider: 'Dr. Jane Smith',
    obsUuid: 'obsUuid2',
    conceptUuid: 'concept1',
    encounterTypeUuid: 'inpatientNoteEncounterTypeUuid',
    isEdited: false,
    lastEditedBy: '',
    lastEditedAt: '2024-08-02T14:22:00Z',
    editHistory: [],
  },
];

const mockEditedPatientNote: PatientNote = {
  encounterUuid: 'note-3',
  encounterNote: 'Updated: Patient is recovering well.',
  encounterNoteRecordedAt: '2024-08-03T09:00:00Z',
  encounterProvider: 'Dr. John Doe',
  obsUuid: 'obsUuid3',
  conceptUuid: 'concept1',
  encounterTypeUuid: 'inpatientNoteEncounterTypeUuid',
  isEdited: true,
  lastEditedBy: 'Dr. Jane Smith',
  lastEditedAt: '2024-08-04T11:00:00Z',
  editHistory: [
    {
      note: 'Original: Patient is stable.',
      recordedAt: '2024-08-03T09:00:00Z',
      recordedBy: 'Dr. John Doe',
    },
  ],
};

const defaultProps = {
  patientNotes: [],
  mutatePatientNotes: jest.fn(),
  isLoading: false,
  errorFetchingPatientNotes: null,
  promptBeforeClosing: jest.fn(),
};

describe('PatientNotesHistory', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockedUseEmrConfiguration.mockReturnValue({
      emrConfiguration: emrConfigurationMock,
      mutateEmrConfiguration: jest.fn(),
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });
  });

  test('displays loading skeletons when loading', () => {
    render(<PatientNotesHistory {...defaultProps} isLoading={true} />);
    expect(screen.getAllByTestId('in-patient-note-skeleton')).toHaveLength(4);
  });

  test('displays patient notes when available', () => {
    render(<PatientNotesHistory {...defaultProps} patientNotes={mockPatientNotes} />);

    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Patient shows improvement with current medication.')).toBeInTheDocument();
    expect(screen.getByText(/Dr\. John Doe/)).toBeInTheDocument();
    expect(screen.getByText('Blood pressure is slightly elevated. Consider adjusting medication.')).toBeInTheDocument();
    expect(screen.getByText(/Dr\. Jane Smith/)).toBeInTheDocument();
  });

  test('displays "Last edited by" for an edited note', () => {
    render(<PatientNotesHistory {...defaultProps} patientNotes={[mockEditedPatientNote]} />);

    expect(screen.getByText('Updated: Patient is recovering well.')).toBeInTheDocument();
    expect(screen.getByText(/Last edited by:.*Dr\. Jane Smith/)).toBeInTheDocument();
  });
});
