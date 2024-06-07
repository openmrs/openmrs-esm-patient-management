import React from 'react';
import { WardPatientCardBentoElement } from '../../types';
import styles from '../admitted-patient-details.scss';
import { PatientAddressBentoElementConfig } from '../../config-schema';

const wardPatientAddress = (config: PatientAddressBentoElementConfig) => {
  const AdmittedPatientAddress: WardPatientCardBentoElement = ({ patient }) => {
    const { addressFields } = config;

    const preferredAddress = patient?.person?.preferredAddress;

    return (
      <div className={styles.admittedPatientAddress}>
        {addressFields?.map((field, i) => <div key={i}>{preferredAddress?.[field] as string}</div>)}
      </div>
    );
  };

  return AdmittedPatientAddress;
};

export default wardPatientAddress;
