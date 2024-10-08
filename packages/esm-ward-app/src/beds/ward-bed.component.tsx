import React, { ReactNode } from 'react';
import { type Bed } from '../types';
import BedShareDivider from './bed-share-divider.component';
import EmptyBed from './empty-bed.component';
import styles from './ward-bed.scss';
export interface WardBedProps {
  patientCards: Array<ReactNode>;
  bed: Bed;
}

const WardBed: React.FC<WardBedProps> = ({ bed, patientCards }) => {
  return patientCards?.length > 0 ? (
    <OccupiedBed bed={bed} patientCards={patientCards} />
  ) : (
    <EmptyBed bed={bed} />
  );
};

const OccupiedBed: React.FC<WardBedProps> = ({ patientCards }) => {
  // TODO key
  return (
    <div className={styles.occupiedBed}>
      {patientCards.map((patientCard, index: number) => {
        const last = index === patientCards.length - 1;
        return (
          <div key={'occupied-bed-pt-' + index}>
            {patientCard}
            {!last && <BedShareDivider />}
          </div>
        );
      })}
    </div>
  );
};

export default WardBed;
