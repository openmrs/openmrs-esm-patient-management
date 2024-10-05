import React from 'react';
import DefaultWardPatientCard from '../../ward-patient-card/default-ward/default-ward-patient-card.component';
import BedShareDivider from '../bed-share-divider.component';
import styles from '../occupied-bed.scss';
import { type WardBedProps } from './default-ward-bed.component';

const DefaultWardOccupiedBed: React.FC<WardBedProps> = ({ wardPatients, bed }) => {
  return (
    <div className={styles.occupiedBed}>
      {wardPatients.map((wardPatient, index: number) => {
        const last = index === wardPatients.length - 1;
        return (
          <div key={'occupied-bed-pt-' + wardPatient.patient.uuid}>
            <DefaultWardPatientCard {...wardPatient} />
            {!last && <BedShareDivider />}
          </div>
        );
      })}
    </div>
  );
};

export default DefaultWardOccupiedBed;
