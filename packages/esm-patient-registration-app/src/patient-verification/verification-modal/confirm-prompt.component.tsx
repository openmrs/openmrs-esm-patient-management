import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { age, ExtensionSlot, formatDate } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';

const PatientInfo: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.25fr 0.75fr', margin: '0.25rem' }}>
      <span style={{ minWidth: '5rem', fontWeight: 'bold' }}>{label}</span>
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
        <div style={{ display: 'flex', margin: '1rem' }}>
          <ExtensionSlot
            style={{ display: 'flex', alignItems: 'center' }}
            extensionSlotName="patient-photo-slot"
            state={{ patientName: `${patient?.firstName} ${patient?.lastName}` }}
          />
          <div style={{ width: '100%', marginLeft: '0.625rem' }}>
            <PatientInfo
              label={t('patientName', 'Patient name')}
              value={`${patient?.firstName} ${patient?.lastName}`}
            />
            <PatientInfo
              label={t('nationalId', 'National ID')}
              value={patient?.identifications[0]?.identificationNumber}
            />
            <PatientInfo label={t('age', 'Age')} value={age(patient?.dateOfBirth)} />
            <PatientInfo label={t('dateOfBirth', 'Date of birth')} value={formatDate(new Date(patient?.dateOfBirth))} />
            <PatientInfo label={t('gender', 'Gender')} value={capitalize(patient?.gender)} />
            <PatientInfo label={t('nascopNumber', 'Nascop facility no')} value={capitalize(patient?.nascopCCCNumber)} />
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
