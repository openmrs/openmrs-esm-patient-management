import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { age, ExtensionSlot, formatDate } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import styles from './confirm-prompt.scss';

const PatientInfo: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div className={styles.patientInfoRow}>
      <span className={styles.patientInfoLabel} title={label}>
        {label}
      </span>
      <span>{value}</span>
    </div>
  );
};

interface ConfirmPromptProps {
  onConfirm: void;
  close: void;
  patient: any;
}

const ConfirmPrompt: React.FC<ConfirmPromptProps> = ({ close, onConfirm, patient }) => {
  const { t } = useTranslation();
  console.log('=====patient', patient);
  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">
          {t('clientRegistryEmpty', `Patient ${patient?.firstName} ${patient?.lastName} found`)}
        </h3>
      </div>
      <div className="cds--modal-content">
        <p>
          {t(
            'patientDetailsFound',
            'Patient information found in the registry, do you want to use the information to continue with registration?',
          )}
        </p>
        <div className={styles.patientDetailsContainer}>
          <ExtensionSlot
            className={styles.patientPhoto}
            name="patient-photo-slot"
            state={{ patientName: `${patient?.firstName} ${patient?.lastName}` }}
          />
          <div className={styles.patientInfoContainer}>
            <PatientInfo
              label={t('patientName', 'Patient name')}
              value={`${patient?.name[0].given[0]} ${patient?.name[0].family ?? patient?.name[0].family}`}
            />
            {patient.identifier?.map((identifier) => {
              return <PatientInfo label={identifier.type?.text ?? identifier.system} value={identifier.value} />;
            })}
            <PatientInfo label={t('age', 'Age')} value={age(patient?.birthDate)} />
            <PatientInfo label={t('dateOfBirth', 'Date of birth')} value={formatDate(new Date(patient?.birthDate))} />
            <PatientInfo label={t('gender', 'Gender')} value={capitalize(patient?.gender)} />
            <PatientInfo label={t('phone', 'Phone Number')} value={patient?.phoneNumber} />
            <PatientInfo label={t('religion', 'Religion')} value={patient?.religion} />
            <PatientInfo label={t('maritalStatus', 'Marital Status')} value={patient?.maritalStatus} />
            <PatientInfo label={t('educationLevel', 'Education Level')} value={patient?.educationLevel} />
            <PatientInfo label={t('occupation', 'Occupation')} value={patient?.occupation} />
          </div>
        </div>
      </div>
      <div className="cds--modal-footer">
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={onConfirm}>{t('useValues', 'Use values')}</Button>
      </div>
    </>
  );
};

export default ConfirmPrompt;
