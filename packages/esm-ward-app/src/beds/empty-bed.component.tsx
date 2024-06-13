import React from 'react';
import styles from './empty-bed.scss';
import wardPatientCardStyles from '../ward-patient-card/ward-patient-card.scss';
import { type Bed } from '../types';
import { useTranslation } from 'react-i18next';

interface EmptyBedProps {
  bed: Bed;
}

const EmptyBed: React.FC<EmptyBedProps> = ({ bed }) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.container}>
      <span className={`${wardPatientCardStyles.wardPatientBedNumber} ${wardPatientCardStyles.empty}`}>
        {bed.bedNumber}
      </span>
      <p className={styles.emptyBed}>{t('emptyBed', 'Empty bed')}</p>
    </div>
  );
};

export default EmptyBed;
