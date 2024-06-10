import React from 'react';
import { type WardPatientCardBentoElement } from '../../types';
import styles from '../ward-patient-card.scss';
import { type PatientAddressBentoElementConfig } from '../../config-schema';

const wardPatientAddress = (config: PatientAddressBentoElementConfig) => {
  const wardPatientAddress: WardPatientCardBentoElement = ({ patient }) => {
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
