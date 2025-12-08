import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { createErrorHandler, ResponsiveWrapper, showSnackbar, translateFrom, useSession } from '@openmrs/esm-framework';
import { savePatientNote, usePatientNotes } from './notes.resource';
import WardPatientNotesWorkspace from './notes.workspace';
import { emrConfigurationMock, mockInpatientRequestAlice, mockPatient, mockPatientAlice, mockSession } from '__mocks__';
import useEmrConfiguration from '../../hooks/useEmrConfiguration';
import { type WardPatient, type WardPatientWorkspaceDefinition } from '../../types';

const mockWardPatientAlice: WardPatient = {
  visit: mockInpatientRequestAlice.visit,
  patient: mockPatientAlice,
  bed: null,
  inpatientAdmission: null,
  inpatientRequest: mockInpatientRequestAlice,
};

const testProps: WardPatientWorkspaceDefinition = {
  groupProps: {
    wardPatient: mockWardPatientAlice,
  },
  closeWorkspace: jest.fn(),
  launchChildWorkspace: jest.fn(),
  workspaceProps: undefined,
  windowProps: undefined,
  workspaceName: '',
  windowName: '',
  isRootWorkspace: false,
};

const mockSavePatientNote = savePatientNote as jest.Mock;
const mockedShowSnackbar = jest.mocked(showSnackbar);

jest.mock('./notes.resource', () => ({
  savePatientNote: jest.fn(),
  usePatientNotes: jest.fn(),
}));

jest.mock('../../hooks/useEmrConfiguration', () => jest.fn());

const mockedUseEmrConfiguration = jest.mocked(useEmrConfiguration);
const mockedUsePatientNotes = jest.mocked(usePatientNotes);

mockedUseEmrConfiguration.mockReturnValue({
  emrConfiguration: emrConfigurationMock,
  mutateEmrConfiguration: jest.fn(),
  isLoadingEmrConfiguration: false,
  errorFetchingEmrConfiguration: null,
});

describe('<WardPatientNotesWorkspace>', () => {
  mockedUsePatientNotes.mockReturnValue({
    patientNotes: [],
    errorFetchingPatientNotes: undefined,
    isLoadingPatientNotes: false,
    mutatePatientNotes: jest.fn(),
  });

  test('renders the visit notes form with all the relevant fields and values', () => {
    renderWardPatientNotesForm();

    expect(screen.getByRole('textbox', { name: /Write your notes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

  test('renders a success snackbar upon successfully recording a visit note', async () => {
    const successPayload = {
      encounterProviders: expect.arrayContaining([
        {
          encounterRole: emrConfigurationMock?.clinicianEncounterRole?.uuid,
          provider: undefined,
        },
      ]),
      encounterType: emrConfigurationMock?.inpatientNoteEncounterType?.uuid,
      location: undefined,
      obs: expect.arrayContaining([
        {
          concept: { display: '', uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
          value: 'Sample clinical note',
        },
      ]),
      patient: mockPatientAlice.uuid,
    };

    mockSavePatientNote.mockResolvedValue({ status: 201, body: 'Condition created' });

    renderWardPatientNotesForm();

    const note = screen.getByRole('textbox', { name: /Write your notes/i });
    await userEvent.clear(note);
    await userEvent.type(note, 'Sample clinical note');
    expect(note).toHaveValue('Sample clinical note');

    const submitButton = screen.getByRole('button', { name: /Save/i });
    await userEvent.click(submitButton);

    expect(mockSavePatientNote).toHaveBeenCalledTimes(1);
    expect(mockSavePatientNote).toHaveBeenCalledWith(expect.objectContaining(successPayload), new AbortController());
  });

  test('renders an error snackbar if there was a problem recording a visit note', async () => {
    const error = {
      message: 'Internal Server Error',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    mockSavePatientNote.mockRejectedValueOnce(error);
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
      title: 'Error saving patient note',
    });
  });
});

function renderWardPatientNotesForm() {
  render(<WardPatientNotesWorkspace {...testProps} />);
}
