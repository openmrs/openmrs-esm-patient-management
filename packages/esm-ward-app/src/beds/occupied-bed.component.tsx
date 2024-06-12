import React from 'react';
import { type Patient } from '@openmrs/esm-framework';
import { type Bed } from '../types';
import styles from './occupied-bed.scss';
import { Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import WardPatientCard from '../ward-patient-card/ward-pateint-card.component';

export interface AdmittedPatientProps {
  patients: Patient[];
  bed: Bed | null;
}
const OccupiedBed: React.FC<AdmittedPatientProps> = ({ patients, bed }) => {
  return (
    <div className={styles.occuipedBed}>
      {patients.map((patient, index: number) => {
        const last = index === patients.length - 1;
        return (
          <div key={patient.uuid + ' ' + index}>
            <WardPatientCard patient={patient} bed={bed} status={'admitted'} />
            {!last && <BedShareDivider />}
          </div>
        );
      })}
    </div>
  );
};

const BedShareDivider = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.bedDivider}>
      <div className={styles.bedDividerLine}></div>
      <Tag>{t('bedshare', 'Bed share')}</Tag>
      <div className={styles.bedDividerLine}></div>
    </div>
  );
};

export default OccupiedBed;
