import React from 'react';
import { type WardPatientCardElement } from '../../types';
import styles from '../ward-patient-card.scss';

const WardPatientName: WardPatientCardElement = ({ patient }) => {
  // TODO: BED-10
  // TODO: this is a hack to support both the patient name rep returned by the bed endpoint (given and family) and the display used by the emr api; this should be fixed once the emr api endpoint is updated
  const { givenName, familyName, display } = patient?.person?.preferredName || {};
  const name = display ? `${display}` : `${givenName} ${familyName}`;
  return <div className={styles.wardPatientName}>{name}</div>;
};

export default WardPatientName;
