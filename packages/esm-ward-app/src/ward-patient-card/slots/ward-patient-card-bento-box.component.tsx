import React from 'react';
import type { WardPatientCardBentoElement, WardPatientCardRow } from '../../types';
import styles from './ward-patient-card-ben-slot.scss';

const WardPatientCardBentoBox = (bentoElements: WardPatientCardBentoElement[], id: string) => {
  const _WardPatientCardBentoBox: WardPatientCardRow = ({ patient, bed }) => {
    return (
      <div className={styles.bentoSlot} data-card-slot-id={id}>
        <div>
          {bentoElements.map((BentoElement, i) => (
            <BentoElement patient={patient} bed={bed} key={i} />
          ))}
        </div>
      </div>
    );
  };

  return _WardPatientCardBentoBox;
};

export default WardPatientCardBentoBox;
