import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification } from '@carbon/react';
import { InlineLoading } from '@carbon/react';
import {
  type DefaultWorkspaceProps,
  ExtensionSlot,
  attach,
  getPatientName,
  usePatient,
  age,
} from '@openmrs/esm-framework';
import styles from './ward-patient.style.scss';

attach('ward-patient-workspace-header-slot', 'patient-vitals-info');

export interface WardPatientWorkspaceProps extends DefaultWorkspaceProps {
  patientUuid: string;
}

export default function WardPatientWorkspace({ patientUuid, setTitle }: WardPatientWorkspaceProps) {
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
