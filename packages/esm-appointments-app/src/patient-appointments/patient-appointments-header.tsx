import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { PatientBannerPatientInfo, PatientPhoto, getPatientName } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styles from './patient-appointments-header.scss';

interface PatientAppointmentsHeaderProps {
  patient: fhir.Patient;
}

const PatientAppointmentsHeader: React.FC<PatientAppointmentsHeaderProps> = ({ patient }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const patientName = getPatientName(patient);

  return (
    <div>
      <div className={styles.titleContainer}>
        <Button
          kind="ghost"
          onClick={() => navigate(-1)}
          renderIcon={ArrowLeft}
          iconDescription={t('back', 'Back')}
          size="lg">
          <span>{t('back', 'Back')}</span>
        </Button>
      </div>
      <div className={styles.divider}></div>
      <div className={styles.patientBanner}>
        <div className={styles.patientAvatar} role="img">
          <PatientPhoto patientUuid={patient.id} patientName={patientName} />
        </div>
        <PatientBannerPatientInfo patient={patient}></PatientBannerPatientInfo>
      </div>
      <div className={styles.divider}></div>
    </div>
  );
};

export default PatientAppointmentsHeader;
