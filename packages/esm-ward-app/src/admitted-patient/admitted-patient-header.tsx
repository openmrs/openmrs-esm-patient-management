import React, { useMemo } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { getPatientDetails } from './patient-details.resource';
import styles from './admitted-patient-header.scss';
import { type AdmittedPatientProps } from './admitted-patient';

const AdmittedPatientHeader: React.FC<AdmittedPatientProps> = ({ patient }) => {
  const { admittedPatientConfig } = useConfig();
  const {
    admittedPatientDefinitions: { fields: patientAdmittedFields },
  } = admittedPatientConfig;
  const patientDetails: Map<string, React.ReactNode> = useMemo(
    () => getPatientDetails(admittedPatientConfig, patient),
    [admittedPatientConfig, patient],
  );
  return (
    <div className={styles.admittedPatientHeader}>
      {patientAdmittedFields.map((field) => {
        return patientDetails.get(field);
      })}
    </div>
  );
};

export default AdmittedPatientHeader;
