import React from 'react';
import type { WardPatientCardSlot, WardPatientCardSlotElement } from '../../types';
import styles from './ward-patient-card-ben-slot.scss';

const wardPatientCardBentoSlot = (slotElements: WardPatientCardSlotElement[], id: string) => {
  const WardPatientCardBentoSlot: WardPatientCardSlot = ({ patient, bed }) => {
    return (
      <div className={styles.bentoSlot} data-card-slot-id={id}>
        <div>
          {slotElements.map((SlotElement, i) => (
            <SlotElement patient={patient} bed={bed} key={i} />
          ))}
        </div>
      </div>
    );
  };

  return WardPatientCardBentoSlot;
};

export default wardPatientCardBentoSlot;
