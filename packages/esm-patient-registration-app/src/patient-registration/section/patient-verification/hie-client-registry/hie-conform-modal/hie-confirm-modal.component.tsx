import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { age, displayName, ExtensionSlot, formatDate } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';

const PatientInfo: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '0.25fr 0.75fr', margin: '0.25rem' }}>
      <span style={{ minWidth: '5rem', fontWeight: 'bold' }}>{label}</span>
      <span>{value}</span>
    </div>
  );
};

interface HIECOnfirmModalProps {
  onConfirm: void;
  close: void;
  patient: fhir.Patient;
}

const HIECOnfirmModal: React.FC<HIECOnfirmModalProps> = ({ close, onConfirm, patient }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">
          {t('clientRegistryEmpty', `Patient ${displayName(patient)} found`)}
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
            name="patient-photo-slot"
            state={{ patientName: `${patient?.name[0].given} ${patient?.name[0].family}` }}
          />
          <div style={{ width: '100%', marginLeft: '0.625rem' }}>
            <PatientInfo label={t('patientName', 'Patient name')} value={displayName(patient)} />
            {patient?.telecom?.map((telecom) => (
              <PatientInfo key={telecom.value} label={telecom.system} value={telecom.value} />
            ))}
            <PatientInfo label={t('age', 'Age')} value={age(patient?.birthDate)} />
            <PatientInfo label={t('dateOfBirth', 'Date of birth')} value={formatDate(new Date(patient?.birthDate))} />
            <PatientInfo label={t('gender', 'Gender')} value={capitalize(patient?.gender)} />
            {patient?.identifier?.map((identifier) => (
              <PatientInfo
                key={identifier.value}
                label={identifier.type.coding?.map((code) => code.display).join('')}
                value={identifier.value}
              />
            ))}
            <PatientInfo label={t('shaNumber', 'SHA Number')} value={'--'} />
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

export default HIECOnfirmModal;
