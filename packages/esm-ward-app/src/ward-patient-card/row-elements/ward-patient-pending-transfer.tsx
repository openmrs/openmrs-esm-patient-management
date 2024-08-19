import React, { useMemo } from 'react';
import { Movement } from '@carbon/react/icons';
import styles from '../ward-patient-card.scss';
import { useTranslation } from 'react-i18next';
import { type WardPatient } from '../../types';

export interface WardPatientTransferProps {
  wardPatient: WardPatient;
}

const WardPatientPendingTransfer: React.FC<WardPatientTransferProps> = ({ wardPatient }) => {
  const { t } = useTranslation();

  const { dispositionType, dispositionLocation } = wardPatient?.inpatientRequest;
  const message = useMemo(() => {
    if (dispositionType === 'TRANSFER') {
      if (dispositionLocation) {
        return t('transferToDispositionLocation', 'Transfer to {{location}}', { location: dispositionLocation.name });
      }
      return t('pendingTransfer', 'Pending Transfer');
    }
    if (dispositionType === 'DISCHARGE') {
      return t('pendingDischarge', 'Pending Discharge');
    }
    return '';
  }, [dispositionType, dispositionLocation]);

  if (!(dispositionType === 'TRANSFER' || dispositionType === 'DISCHARGE')) return null;

  return (
    <div className={styles.wardPatientCardDispositionTypeContainer}>
      <Movement className={styles.movementIcon} size="24" />
      {message}
    </div>
  );
};

export default WardPatientPendingTransfer;
