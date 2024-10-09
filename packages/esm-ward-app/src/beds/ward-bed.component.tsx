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

  // interlace patient card with bed dividers between each of them
  const patientCardsWithDividers = patientCards.flatMap(
    (patientCard, index) => {
      if(index == 0) {
        return [patientCard];
      } else {
        return [<BedShareDivider key={'divider-' + index} />, patientCard]
      }
    }
  );

  return (
    <div className={styles.occupiedBed}>
      {patientCardsWithDividers}
    </div>
  );
};

export default WardBed;
