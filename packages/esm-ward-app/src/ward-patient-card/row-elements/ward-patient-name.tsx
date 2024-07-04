import { getPatientName, usePatient } from '@openmrs/esm-framework';
import React from 'react';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';
import { SkeletonText } from '@carbon/react';

const WardPatientName: WardPatientCardElement = ({ patient: { uuid: patientUuid } }) => {
  const { patient, isLoading } = usePatient(patientUuid);

  if (!patient || isLoading) return <SkeletonText width="40%" />;
  return <div className={styles.wardPatientName}>{getPatientName(patient)}</div>;
};

export default WardPatientName;
