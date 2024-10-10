import React, { type ReactNode } from 'react';
import { type Bed } from '../types';
import EmptyBed from './empty-bed.component';
import styles from './ward-bed.scss';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';

export interface WardBedProps {
  patientCards: Array<ReactNode>;
  bed: Bed;
}

const WardBed: React.FC<WardBedProps> = ({ bed, patientCards }) => {
  return patientCards?.length > 0 ? <OccupiedBed bed={bed} patientCards={patientCards} /> : <EmptyBed bed={bed} />;
};

const OccupiedBed: React.FC<WardBedProps> = ({ patientCards }) => {
  // interlace patient card with bed dividers between each of them
  const patientCardsWithDividers = patientCards.flatMap((patientCard, index) => {
    if (index == 0) {
      return [patientCard];
    } else {
      return [<BedShareDivider key={'divider-' + index} />, patientCard];
    }
  });

  return <div className={styles.occupiedBed}>{patientCardsWithDividers}</div>;
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

export default WardBed;
