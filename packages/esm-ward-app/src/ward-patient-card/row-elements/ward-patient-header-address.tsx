import React from 'react';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';
import { type PatientAddressElementConfig } from '../../config-schema';

const wardPatientAddress = (config: PatientAddressElementConfig) => {
  const wardPatientAddress: WardPatientCardElement = ({ patient }) => {
    const { addressFields } = config;

    const preferredAddress = patient?.person?.preferredAddress;

    return (
      <div className={styles.wardPatientAddress}>
        {addressFields?.map((field, i) => <div key={i}>{preferredAddress?.[field] as string}</div>)}
      </div>
    );
  };

  return wardPatientAddress;
};

export default wardPatientAddress;
