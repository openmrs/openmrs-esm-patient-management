import { age, attach, ExtensionSlot, type Patient } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import styles from './ward-patient.style.scss';
import { useTranslation } from 'react-i18next';
import { type WardPatientWorkspaceProps } from '../../types';
import { getGender } from '../../ward-patient-card/row-elements/ward-patient-gender.component';

attach('ward-patient-workspace-header-slot', 'patient-vitals-info');

export default function WardPatientWorkspace({ setTitle, wardPatient }: WardPatientWorkspaceProps) {
  useEffect(() => {
    if (wardPatient) {
      const { patient } = wardPatient;
      setTitle(patient.person.display, <PatientWorkspaceTitle key={patient.uuid} patient={patient} />);
    }
  }, [wardPatient]);

  return (
    <>
      {wardPatient && (
        <div className={styles.workspaceContainer}>
          <WardPatientWorkspaceView patient={wardPatient.patient} />
        </div>
      )}
    </>
  );
}

interface WardPatientWorkspaceViewProps {
  patient: Patient;
}

const WardPatientWorkspaceView: React.FC<WardPatientWorkspaceViewProps> = ({ patient }) => {
  const extensionSlotState = { patient, patientUuid: patient.uuid };

  return (
    <>
      <div>
        <ExtensionSlot name="ward-patient-workspace-header-slot" state={extensionSlotState} />
      </div>
      <div>
        <ExtensionSlot name="ward-patient-workspace-content-slot" state={extensionSlotState} />
      </div>
    </>
  );
};

const PatientWorkspaceTitle: React.FC<WardPatientWorkspaceViewProps> = ({ patient }) => {
  const { t } = useTranslation();

  return (
    <>
      <div>{patient.person.display} &nbsp;</div>
      <div className={styles.headerPatientDetail}>&middot; &nbsp; {getGender(t, patient.person?.gender)}</div>
      {patient.person?.birthdate && (
        <div className={styles.headerPatientDetail}>&middot; &nbsp; {age(patient.person?.birthdate)}</div>
      )}
    </>
  );
};
