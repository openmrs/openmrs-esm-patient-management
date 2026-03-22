import React from 'react';
import { Document } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { ActionMenuButton2 } from '@openmrs/esm-framework';
import type { WardPatientWorkspaceDefinition } from '../types';

const ClinicalFormsWorkspaceSideRailIcon: React.FC<WardPatientWorkspaceDefinition> = ({
  groupProps: { wardPatient },
}) => {
  const { t } = useTranslation();

  return (
    <ActionMenuButton2
      icon={(props) => <Document {...props} />}
      label={t('clinicalForms', 'Clinical forms')}
      workspaceToLaunch={{
        workspaceName: 'ward-patient-clinical-forms-workspace',
        windowProps: {
          formEntryWorkspaceName: 'ward-patient-form-entry-workspace',
          patient: wardPatient.patient,
          patientUuid: wardPatient.patient.uuid,
          visitContext: wardPatient.visit,
        },
      }}
    />
  );
};

export default ClinicalFormsWorkspaceSideRailIcon;
