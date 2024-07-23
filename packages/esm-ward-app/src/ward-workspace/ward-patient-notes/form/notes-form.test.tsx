import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { showSnackbar, useConfig, useSession } from '@openmrs/esm-framework';
import { saveVisitNote } from '../visit-notes.resource';
import {
  ConfigMock,
  mockFetchLocationByUuidResponse,
  mockFetchProviderByUuidResponse,
  mockSessionDataResponse,
} from '__mocks__';
import { mockPatient } from 'tools';
import WardPatientNotesForm from './notes-form.component';

const testProps = {
  patientUuid: mockPatient.id,
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
  onWorkspaceClose: jest.fn(),
};

const mockSaveVisitNote = saveVisitNote as jest.Mock;
const mockedShowSnackbar = jest.mocked(showSnackbar);
const mockUseConfig = useConfig as jest.Mock;
const mockUseSession = useSession as jest.Mock;

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    createErrorHandler: jest.fn(),
    showSnackbar: jest.fn(),
    useConfig: jest.fn().mockReturnValue(() => ConfigMock),
    useSession: jest.fn().mockReturnValue(() => mockSessionDataResponse),
  };
});

jest.mock('../visit-notes.resource', () => ({
  fetchDiagnosisConceptsByName: jest.fn(),
  useLocationUuid: jest.fn().mockImplementation(() => ({
    data: mockFetchLocationByUuidResponse.data.uuid,
  })),
  useProviderUuid: jest.fn().mockImplementation(() => ({
    data: mockFetchProviderByUuidResponse.data.uuid,
  })),
  saveVisitNote: jest.fn(),
  useVisitNotes: jest.fn().mockImplementation(() => ({
    mutateVisitNotes: jest.fn(),
  })),
  useInfiniteVisits: jest.fn().mockImplementation(() => ({
    mutateVisits: jest.fn(),
  })),
}));

test('renders the visit notes form with all the relevant fields and values', () => {
  renderWardPatientNotesForm();

  expect(screen.getByRole('textbox', { name: /Write your notes/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
});

test('renders a success snackbar upon successfully recording a visit note', async () => {
  const successPayload = {
    encounterProviders: expect.arrayContaining([
      {
        encounterRole: ConfigMock.visitNoteConfig.clinicianEncounterRole,
        provider: undefined,
      },
    ]),
    encounterType: ConfigMock.visitNoteConfig.encounterTypeUuid,
    location: undefined,
    obs: expect.arrayContaining([
      {
        concept: { display: '', uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Sample clinical note',
      },
    ]),
    patient: mockPatient.id,
  };

  mockSaveVisitNote.mockResolvedValueOnce({ status: 201, body: 'Condition created' });

  renderWardPatientNotesForm();

  const note = screen.getByRole('textbox', { name: /Write your notes/i });
  await userEvent.clear(note);
  await userEvent.type(note, 'Sample clinical note');
  expect(note).toHaveValue('Sample clinical note');

  const submitButton = screen.getByRole('button', { name: /Save/i });
  await userEvent.click(submitButton);

  expect(mockSaveVisitNote).toHaveBeenCalledTimes(1);
  expect(mockSaveVisitNote).toHaveBeenCalledWith(new AbortController(), expect.objectContaining(successPayload));
});

test('renders an error snackbar if there was a problem recording a visit note', async () => {
  const error = {
    message: 'Internal Server Error',
    response: {
      status: 500,
      statusText: 'Internal Server Error',
    },
  };

  mockSaveVisitNote.mockRejectedValueOnce(error);
  renderWardPatientNotesForm();

  const note = screen.getByRole('textbox', { name: /Write your notes/i });
  await userEvent.clear(note);
  await userEvent.type(note, 'Sample clinical note');
  expect(note).toHaveValue('Sample clinical note');

  const submitButton = screen.getByRole('button', { name: /Save/i });

  await userEvent.click(submitButton);

  expect(mockedShowSnackbar).toHaveBeenCalledWith({
    isLowContrast: false,
    kind: 'error',
    subtitle: 'Internal Server Error',
    title: 'Error saving visit note',
  });
});

function renderWardPatientNotesForm() {
  mockUseConfig.mockReturnValue(ConfigMock);
  mockUseSession.mockReturnValue(mockSessionDataResponse);
  render(<WardPatientNotesForm {...testProps} />);
}
