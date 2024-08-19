import React from 'react';
import { render, screen } from '@testing-library/react';
import PatientNotesHistory from './notes-container.component';
import { usePatientNotes } from '../notes.resource';
import useEmrConfiguration from '../../../hooks/useEmrConfiguration';
import { emrConfigurationMock } from '__mocks__';

const mockedUseEmrConfiguration = jest.mocked(useEmrConfiguration);

jest.mock('../../../hooks/useEmrConfiguration', () => jest.fn());

jest.mock('../notes.resource', () => ({
  usePatientNotes: jest.fn(),
}));

const mockPatientUuid = 'sample-patient-uuid';

const mockPatientNotes = [
  {
    id: 'note-1',
    diagnoses: '',
    encounterDate: '2024-08-01',
    encounterNote: 'Patient shows improvement with current medication.',
    encounterNoteRecordedAt: '2024-08-01T12:34:56Z',
    encounterProvider: 'Dr. John Doe',
    encounterProviderRole: 'Endocrinologist',
  },
  {
    id: 'note-2',
    diagnoses: '',
    encounterDate: '2024-08-02',
    encounterNote: 'Blood pressure is slightly elevated. Consider adjusting medication.',
    encounterNoteRecordedAt: '2024-08-02T14:22:00Z',
    encounterProvider: 'Dr. Jane Smith',
    encounterProviderRole: 'Cardiologist',
  },
];

describe('PatientNotesHistory', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('displays loading skeletons when loading', () => {
    mockedUseEmrConfiguration.mockReturnValue({
      emrConfiguration: emrConfigurationMock,
      mutateEmrConfiguration: jest.fn(),
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });

    usePatientNotes.mockReturnValue({
      patientNotes: [],
      isLoadingPatientNotes: true,
    });

    render(<PatientNotesHistory patientUuid={mockPatientUuid} />);

    expect(screen.getAllByTestId('in-patient-note-skeleton')).toHaveLength(4);
  });

  test('displays patient notes when available', () => {
    mockedUseEmrConfiguration.mockReturnValue({
      emrConfiguration: emrConfigurationMock,
      mutateEmrConfiguration: jest.fn(),
      isLoadingEmrConfiguration: false,
      errorFetchingEmrConfiguration: null,
    });

    usePatientNotes.mockReturnValue({
      patientNotes: mockPatientNotes,
      isLoadingPatientNotes: false,
    });

    render(<PatientNotesHistory patientUuid={mockPatientUuid} />);

    expect(screen.getByText('History')).toBeInTheDocument();

    expect(screen.getByText('Patient shows improvement with current medication.')).toBeInTheDocument();
    expect(screen.getByText('Dr. John Doe')).toBeInTheDocument();
    expect(screen.getByText('Blood pressure is slightly elevated. Consider adjusting medication.')).toBeInTheDocument();
    expect(screen.getByText('Dr. Jane Smith')).toBeInTheDocument();
  });
});
