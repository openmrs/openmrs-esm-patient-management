import React from 'react';
import { PatientAddressConfig } from '../../config-schema';
import styles from '../admitted-patient-details.scss';
import { type AdmittedPatientHeaderProps } from './admitted-patient-header';

const admittedPatientAddress = (config: PatientAddressConfig) =>{
  const AdmittedPatientAddress: React.FC<AdmittedPatientHeaderProps> = ({ patient }) => {
    const { fields } = config;
  
    const preferredAddress = patient?.person?.preferredAddress;
  
    return (
      <div className={styles.admittedPatientAddress}>
        {fields?.map((field) => <div>{preferredAddress?.[field] as string}</div>)}
      </div>
    );
  };

  return AdmittedPatientAddress;
}


export default admittedPatientAddress;
