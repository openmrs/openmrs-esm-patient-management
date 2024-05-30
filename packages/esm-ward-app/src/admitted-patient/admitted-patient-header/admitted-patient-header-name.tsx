import React from 'react';
import { type AdmittedPatientHeaderProps } from './admitted-patient-header';
import styles from '../admitted-patient-details.scss';
import { type AdmittedPatientHeaderNameConfigObject } from './admitted-patient-header-config-schema';
import { useConfig } from '@openmrs/esm-framework';

const AdmittedPatientName: React.FC<AdmittedPatientHeaderProps> = ({ patient }) => {
  const { displayName } = useConfig<AdmittedPatientHeaderNameConfigObject>();
  const { givenName, familyName } = patient?.person?.preferredName;
  const name = displayName === 'normal' ? `${givenName} ${familyName}` : `${familyName} ${givenName}`;
  return <div className={styles.admittedPatientName}>{name}</div>;
};

export default AdmittedPatientName;
