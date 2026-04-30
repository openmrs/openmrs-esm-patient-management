import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2, StickyNoteAddIcon } from '@openmrs/esm-framework';

export default function WardPatientNotesActionButton() {
  const { t } = useTranslation();

  return (
    <ActionMenuButton2
      icon={(props) => <StickyNoteAddIcon {...props} size={16} />}
      label={t('PatientNote', 'Patient Note')}
      workspaceToLaunch={{
        workspaceName: 'ward-patient-notes-workspace',
      }}
    />
  );
}
