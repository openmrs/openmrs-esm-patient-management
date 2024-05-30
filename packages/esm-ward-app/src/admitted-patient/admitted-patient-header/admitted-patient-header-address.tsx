import React from 'react';
import { type AdmittedPatientHeaderProps } from './admitted-patient-header';
import { type AdmittedPatientHeaderAddressConfigObject } from './admitted-patient-header-config-schema';
import { Patient, useConfig, type PersonAddress } from '@openmrs/esm-framework';
import styles from '../admitted-patient-details.scss';

const AdmittedPatientAddress: React.FC<AdmittedPatientHeaderProps> = ({ patient }) => {
  const { fields, addressType } = useConfig<AdmittedPatientHeaderAddressConfigObject>();

  // TODO: the server doesn't populate patient?.person?.addresses for some reason
  // const addresses = addressType == "preferred" ?
  //   patient?.person?.preferredAddress :
  //   patient?.person?.addresses;
  const preferredAddress = patient?.person?.preferredAddress;
  const addresses = preferredAddress ? [preferredAddress] : [];

  return (
    <div className={styles.admittedPatientAddress}>
      {addresses.map((address) => {
        return fields.map((field) => <div>{address[field] as string}</div>);
      })}
    </div>
  );
};

export default AdmittedPatientAddress;
