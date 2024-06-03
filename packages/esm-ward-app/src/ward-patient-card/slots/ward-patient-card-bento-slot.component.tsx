import React from 'react';
import type { WardPatientCardSlot, WardPatientCardSlotElement } from '../../types';
import styles from "./ward-patient-card-ben-slot.scss";

const wardPatientCardBentoSlot = (slotElements : WardPatientCardSlotElement[]) => {

  const WardPatientCardBentoSlot: WardPatientCardSlot = ({ patient, bed }) => {
    return (
      <div className={styles.bentoSlot}>
        <div>
        {slotElements.map((SlotElement, i) => (
          <SlotElement patient={patient} bed={bed} />
        ))}
        </div>
      </div>
    );
  };

  return WardPatientCardBentoSlot;
}

export default wardPatientCardBentoSlot;
