import React from 'react';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton, launchWorkspace, StickyNoteAddIcon } from '@openmrs/esm-framework';

export default function WardPatientNotesActionButton({ workspaceProps }: { workspaceProps: any }) {
  const { t } = useTranslation();

  return (
    <ActionMenuButton
      getIcon={(props) => <StickyNoteAddIcon {...props} size={16} />}
      label={t('PatientNote', 'Patient Note')}
      iconDescription={t('PatientNote', 'Patient Note')}
      handler={() => launchWorkspace('ward-patient-notes-workspace')}
      type={'ward-patient-notes'}
    />
  );
}
