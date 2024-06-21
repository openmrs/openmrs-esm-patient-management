import { Tag } from '@carbon/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import WardPatientCard from '../ward-patient-card/ward-patient-card';
import { type WardBedProps } from '../ward-view/ward-bed.component';
import styles from './occupied-bed.scss';

const OccupiedBed: React.FC<WardBedProps> = ({ patientInfos, bed }) => {
  return (
    <div className={styles.occupiedBed}>
      {patientInfos.map(({ patient, visit }, index: number) => {
        const last = index === patientInfos.length - 1;
        return (
          <div key={'occupied-bed-pt-' + patient.uuid}>
            <WardPatientCard patient={patient} visit={visit} bed={bed} />
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
      <Tag>{t('bedShare', 'Bed share')}</Tag>
      <div className={styles.bedDividerLine}></div>
    </div>
  );
};

export default OccupiedBed;
