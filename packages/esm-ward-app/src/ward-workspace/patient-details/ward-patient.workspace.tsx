import { attach, ExtensionSlot } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './ward-patient.style.scss';

attach('ward-patient-workspace-header-slot', 'patient-vitals-info');

export default function WardPatientWorkspace({ wardPatient, WardPatientHeader }: WardPatientWorkspaceProps) {
  const { patient } = wardPatient ?? {};
  const extensionSlotState = { patient, patientUuid: patient?.uuid };

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
