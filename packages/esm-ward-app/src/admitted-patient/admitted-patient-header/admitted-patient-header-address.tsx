import React from 'react';
import { AdmittedPatientHeaderProps } from './admitted-patient-header';
import { AdmittedPatientHeaderAddressConfigObject } from './admitted-patient-header-config-schema';
import { useConfig } from '@openmrs/esm-framework';

const AdmittedPatientAddress: React.FC<AdmittedPatientHeaderProps> = ({ patient }) => {

  const {fields, addressType} = useConfig<AdmittedPatientHeaderAddressConfigObject>();
  
  // TODO: the server doesn't populate patient?.person?.addresses for some reason
  // const addresses = addressType == "preferred" ?
  //   patient?.person?.preferredAddress :
  //   patient?.person?.addresses;
  const preferredAddress = patient?.person?.preferredAddress;
  const addresses = preferredAddress? [preferredAddress] : [];

  return (
    <>
      {addresses.map((address) => {
        return fields.map(field => address[field]);
      })}
    </>
  );
};

export default AdmittedPatientAddress;
