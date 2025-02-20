import React from 'react';
import { Button } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PatientBannerPatientInfo, PatientPhoto, getPatientName } from '@openmrs/esm-framework';
import styles from './patient-appointments-header.scss';

interface PatientAppointmentsHeaderProps {
  patient: fhir.Patient;
}

const PatientAppointmentsHeader: React.FC<PatientAppointmentsHeaderProps> = ({ patient }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const patientName = getPatientName(patient);

  return (
    <header>
      <div className={styles.titleContainer}>
        <Button
          className={styles.backButton}
          iconDescription={t('back', 'Back')}
          kind="ghost"
          onClick={() => navigate(-1)}
          renderIcon={ArrowLeft}
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
    </header>
  );
};

export default PatientAppointmentsHeader;
