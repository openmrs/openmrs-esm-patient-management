import React from 'react';
import styles from '../ward-patient-card.scss';
import { type Patient } from '@openmrs/esm-framework';
import { type AddressElementDefinition } from '../../config-schema';

export interface WardPatientAddressProps {
  patient: Patient;
  config: AddressElementDefinition;
}

const WardPatientAddress: React.FC<WardPatientAddressProps> = ({ patient, config }) => {
  const preferredAddress = patient?.person?.preferredAddress;

  return (
    <>
      {config.fields?.map((field, i) =>
        preferredAddress?.[field] ? <div key={i}>{preferredAddress?.[field] as string}</div> : <div key={i}></div>,
      )}
    </>
  );
};

export default WardPatientAddress;
