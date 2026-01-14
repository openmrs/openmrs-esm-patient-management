import { attach, ExtensionSlot, useConfig, Workspace2 } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientWorkspaceDefinition } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './ward-patient.style.scss';
import { type WardConfigObject } from '../../config-schema';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

attach('ward-patient-workspace-header-slot', 'patient-vitals-info');

export default function WardPatientWorkspace({
  groupProps: { wardPatient },
  launchChildWorkspace,
}: WardPatientWorkspaceDefinition) {
  const { t } = useTranslation();
  const { patient, visit } = wardPatient ?? {};
  const { hideWorkspaceVitalsLinks } = useConfig<WardConfigObject>();
  const extensionSlotState = {
    patient,
    patientUuid: patient?.uuid,
    hideLinks: hideWorkspaceVitalsLinks,
    visitContext: visit,
    launchCustomVitalsForm: () => {
      launchChildWorkspace('ward-patient-vitals-workspace', {
        patientUuid: patient.uuid,
        patient: {
          id: patient.uuid,
          birthDate: patient.person?.birthdate,
        } as fhir.Patient,
        visitContext: visit,
      });
    },
  };

  return (
    <Workspace2 title={t('wardPatient', 'Ward patient')}>
      {wardPatient && (
        <div className={classNames(styles.workspaceContainer, styles.patientWorkspace)}>
          <WardPatientWorkspaceBanner {...{ wardPatient }} />
          <ExtensionSlot name="ward-patient-workspace-header-slot" state={extensionSlotState} />
          <ExtensionSlot
            name="ward-patient-workspace-content-slot"
            state={extensionSlotState}
            className={styles.patientWorkspaceContentSlot}
          />
        </div>
      )}
    </Workspace2>
  );
}
