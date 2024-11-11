import React, { type ReactNode } from 'react';
import type { WardPatient, WardPatientCardType } from '../../types';
import AdmissionRequestCardActions from './admission-request-card-actions.component';
import AdmissionRequestCardHeader from './admission-request-card-header.component';
import styles from './admission-request-card.scss';

interface AdmissionRequestCardProps {
  wardPatient: WardPatient;
  children?: ReactNode;
}

const AdmissionRequestCard: React.FC<AdmissionRequestCardProps> = ({ wardPatient, children }) => {
  return (
    <div className={styles.admissionRequestCard}>
      <AdmissionRequestCardHeader {...{ wardPatient }} />
      {children}
      <AdmissionRequestCardActions {...{ wardPatient }} />
    </div>
  );
};

export default AdmissionRequestCard;
