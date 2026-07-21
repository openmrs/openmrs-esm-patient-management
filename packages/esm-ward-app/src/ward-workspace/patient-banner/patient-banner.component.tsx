import React from 'react';
import classNames from 'classnames';
import { useAppContext } from '@openmrs/esm-framework';
import type { WardPatientCardType, WardViewContext } from '../../types';
import wardPatientCardStyles from '../../ward-patient-card/ward-patient-card.scss';
import styles from './style.scss';

const WardPatientWorkspaceBanner: WardPatientCardType = ({ wardPatient }) => {
  const { patient } = wardPatient ?? {};
  const { WardPatientHeader } = useAppContext<WardViewContext>('ward-view-context') ?? {};

  if (!patient) {
    console.warn('Patient details were not received by the ward workspace');
    return null;
  }

  return WardPatientHeader ? (
    <div className={classNames(styles.wardWorkspacePatientBanner, wardPatientCardStyles.wardPatientCard)}>
      <WardPatientHeader wardPatient={wardPatient} />
    </div>
  ) : (
    <></>
  );
};

export default WardPatientWorkspaceBanner;
