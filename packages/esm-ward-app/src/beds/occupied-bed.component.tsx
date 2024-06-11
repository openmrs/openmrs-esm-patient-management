import React from 'react';
import { type Patient } from '@openmrs/esm-framework';
import { type Bed } from '../types';
import styles from './occupied-bed.scss';
import { Tag } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import WardPatientCard from '../ward-patient-card/ward-patient-card';

export interface OccupiedBedProps {
  patients: Patient[];
  bed: Bed;
}
const OccupiedBed: React.FC<OccupiedBedProps> = ({ patients, bed }) => {
  return (
    <div className={styles.occupiedBed}>
      {patients.map((patient, index: number) => {
        const last = index === patients.length - 1;
        return (
          <div key={patient.uuid}>
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
