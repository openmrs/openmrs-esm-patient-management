import { useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import type { WardPatientCardType, WardViewContext } from '../../types';
import styles from './style.scss';

const WardPatientWorkspaceBanner: WardPatientCardType = ({ wardPatient }) => {
  const { patient } = wardPatient ?? {};
  const { WardPatientHeader } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  if (!patient) {
    console.warn('Patient details were not received by the ward workspace');
    return null;
  }

  return WardPatientHeader ? (
    <div className={styles.wardWorkspacePatientBanner}>
      <WardPatientHeader wardPatient={wardPatient} />
    </div>
  ) : (
    <></>
  );
};

export default WardPatientWorkspaceBanner;
