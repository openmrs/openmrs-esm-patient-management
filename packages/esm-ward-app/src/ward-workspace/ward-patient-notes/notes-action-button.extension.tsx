import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, launchWorkspace, StickyNoteAddIcon } from '@openmrs/esm-framework';
import { type WardPatientNotesWorkspaceProps } from './notes.workspace';

export default function WardPatientNotesActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props) => <StickyNoteAddIcon {...props} size={16} />}
      label={t('PatientNote', 'Patient Note')}
      iconDescription={t('PatientNote', 'Patient Note')}
      handler={() => launchWorkspace<WardPatientNotesWorkspaceProps>('ward-patient-notes-workspace')}
      type={'ward-patient-notes'}
    />
  );
}
