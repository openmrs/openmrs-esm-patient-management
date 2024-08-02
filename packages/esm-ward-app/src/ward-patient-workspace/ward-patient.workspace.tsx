import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineLoading, InlineNotification } from '@carbon/react';
import { age, attach, ExtensionSlot, getPatientName, usePatient } from '@openmrs/esm-framework';
import styles from './ward-patient.style.scss';
import { type WardPatientWorkspaceProps } from './types';

attach('ward-patient-workspace-header-slot', 'patient-vitals-info');

export default function WardPatientWorkspace({ setTitle, patientUuid }: WardPatientWorkspaceProps) {
  const { t } = useTranslation();
  const { patient, isLoading, error } = usePatient(patientUuid);

  useEffect(() => {
    if (isLoading) {
      setTitle(t('wardPatientWorkspaceTitle', 'Ward Patient'), <InlineLoading />);
    } else if (patient) {
      setTitle(getPatientName(patient), <PatientWorkspaceTitle patient={patient} />);
    } else if (error) {
      setTitle(t('wardPatientWorkspaceTitle', 'Ward Patient'));
    }
  }, [patient]);

  return (
    <div className={styles.workspaceContainer}>
      {isLoading ? (
        <InlineLoading />
      ) : patient ? (
        <WardPatientWorkspaceView patient={patient} />
      ) : error ? (
        <InlineNotification>{error.message}</InlineNotification>
      ) : (
        <InlineNotification>
          {t('failedToLoadPatientWorkspace', 'Ward patient workspace has failed to load.')}
        </InlineNotification>
      )}
    </div>
  );
}

interface WardPatientWorkspaceViewProps {
  patient: fhir.Patient;
}

function WardPatientWorkspaceView({ patient }: WardPatientWorkspaceViewProps) {
  const extensionSlotState = useMemo(() => ({ patient, patientUuid: patient.id }), [patient]);

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
}

function PatientWorkspaceTitle({ patient }: { patient: fhir.Patient }) {
  return (
    <>
      <div>{getPatientName(patient)} &nbsp;</div>
      <div className={styles.headerPatientDetail}>&middot; &nbsp; {patient.gender}</div>
      <div className={styles.headerPatientDetail}>&middot; &nbsp; {age(patient.birthDate)}</div>
    </>
  );
}
