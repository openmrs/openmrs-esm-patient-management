import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { createErrorHandler, ResponsiveWrapper, showSnackbar, translateFrom, useSession } from '@openmrs/esm-framework';
import { savePatientNote } from './notes-form.resource';
import PatientNotesForm from './notes-form.component';
import { emrConfigurationMock, mockPatient, mockSession } from '__mocks__';
import useEmrConfiguration from '../../../hooks/useEmrConfiguration';

const testProps = {
  patientUuid: mockPatient.uuid,
  closeWorkspace: jest.fn(),
  closeWorkspaceWithSavedChanges: jest.fn(),
  promptBeforeClosing: jest.fn(),
  setTitle: jest.fn(),
  onWorkspaceClose: jest.fn(),
  setOnCloseCallback: jest.fn(),
};

const mockSavePatientNote = savePatientNote as jest.Mock;
const mockedShowSnackbar = jest.mocked(showSnackbar);
const mockedCreateErrorHandler = jest.mocked(createErrorHandler);
const mockedTranslateFrom = jest.mocked(translateFrom);
const mockedResponsiveWrapper = jest.mocked(ResponsiveWrapper);
const mockedUseSession = jest.mocked(useSession);

jest.mock('./notes-form.resource', () => ({
  savePatientNote: jest.fn(),
}));

jest.mock('../../../hooks/useEmrConfiguration', () => jest.fn());

const mockedUseEmrConfiguration = jest.mocked(useEmrConfiguration);

mockedUseEmrConfiguration.mockReturnValue({
  emrConfiguration: emrConfigurationMock,
  mutateEmrConfiguration: jest.fn(),
  isLoadingEmrConfiguration: false,
  errorFetchingEmrConfiguration: null,
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
        encounterRole: emrConfigurationMock.clinicianEncounterRole.uuid,
        provider: undefined,
      },
    ]),
    encounterType: emrConfigurationMock.visitNoteEncounterType.uuid,
    location: undefined,
    obs: expect.arrayContaining([
      {
        concept: { display: '', uuid: '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA' },
        value: 'Sample clinical note',
      },
    ]),
    patient: mockPatient.uuid,
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

function renderWardPatientNotesForm() {
  mockedUseSession.mockReturnValue(mockSession);
  render(<PatientNotesForm {...testProps} />);
}
