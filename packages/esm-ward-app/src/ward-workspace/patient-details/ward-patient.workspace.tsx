import { attach, ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './ward-patient.style.scss';
import { type WardConfigObject } from '../../config-schema';

attach('ward-patient-workspace-header-slot', 'patient-vitals-info');

export default function WardPatientWorkspace({ wardPatient }: WardPatientWorkspaceProps) {
  const { patient } = wardPatient ?? {};
  const { hideWorkspaceVitalsLinks } = useConfig<WardConfigObject>();
  const extensionSlotState = { patient, patientUuid: patient?.uuid, hideLinks: hideWorkspaceVitalsLinks };

  return (
    <>
      {wardPatient && (
        <div className={styles.workspaceContainer}>
          <WardPatientWorkspaceBanner {...{ wardPatient }} />
          <div>
            <ExtensionSlot name="ward-patient-workspace-header-slot" state={extensionSlotState} />
          </div>
          <div>
            <ExtensionSlot name="ward-patient-workspace-content-slot" state={extensionSlotState} />
          </div>
        </div>
      )}
    </>
  );
}
