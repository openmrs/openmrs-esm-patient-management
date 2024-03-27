import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from '@carbon/react/icons';
import { Button } from '@carbon/react';
import { useNavigate } from 'react-router-dom';
import styles from './patient-appointments-header.scss';
import { PatientBannerPatientInfo, PatientPhoto } from '@openmrs/esm-framework';

interface PatientAppointmentsHeaderProps {
  patient: fhir.Patient;
}

const PatientAppointmentsHeader: React.FC<PatientAppointmentsHeaderProps> = ({ patient }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const patientName = `${patient?.name?.[0]?.given?.join(' ')} ${patient?.name?.[0].family}`;

  return (
    <div>
      <div className={styles.patientBanner}>
        <div className={styles.patientAvatar} role="img">
          <PatientPhoto patientUuid={patient.id} patientName={patientName} />
        </div>
        <PatientBannerPatientInfo patient={patient}></PatientBannerPatientInfo>
      </div>
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
    </div>
  );
};

export default PatientAppointmentsHeader;
