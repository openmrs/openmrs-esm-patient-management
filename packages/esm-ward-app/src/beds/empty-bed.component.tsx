import React from 'react';
import styles from './ward-bed.scss';
import wardPatientCardStyles from '../ward-patient-card/ward-patient-card.scss';
import { type Bed } from '../types';
import { useTranslation } from 'react-i18next';

interface EmptyBedProps {
  bed: Bed;
}

const EmptyBed: React.FC<EmptyBedProps> = ({ bed }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.emptyBed}>
      <span className={`${wardPatientCardStyles.wardPatientBedNumber} ${wardPatientCardStyles.empty}`}>
        {bed.bedNumber}
      </span>
      <p className={styles.emptyBedText}>{t('emptyBed', 'Empty bed')}</p>
    </div>
  );
};

export default EmptyBed;
