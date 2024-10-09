import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import type { WardPatient, WardViewContext } from '../../types';
import styles from './style.scss';

const WardPatientWorkspaceBanner = (wardPatient: WardPatient) => {
  const { patient } = wardPatient;
  const {WardPatientHeader} = useAppContext<WardViewContext>('ward-view-context') ?? {};

  if (!patient) {
    console.warn('Patient details were not received by the ward workspace');
    return null;
  }

  return (
    <div className={styles.patientBanner}>
      {WardPatientHeader && <WardPatientHeader {...wardPatient} />}
    </div>
  );
};

export default WardPatientWorkspaceBanner;
