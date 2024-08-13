import React, { useMemo } from 'react';
import { Movement } from '@carbon/react/icons';
import styles from '../ward-patient-card.scss';
import { useTranslation } from 'react-i18next';
import { type WardPatient } from '../../types';

export interface WardPatientTransferProps {
  wardPatient: WardPatient;
}

const WardPatientTransfer: React.FC<WardPatientTransferProps> = ({ wardPatient }) => {
  const { t } = useTranslation();

  const { dispositionType } = wardPatient?.inpatientRequest;
  const message = useMemo(() => {
    if (dispositionType === 'TRANSFER') {
      return t('transferToDeliveryWard', 'Transfer to Delivery ward');
    }
    if (dispositionType === 'DISCHARGE') {
      return t('transferToDeliveryWard', 'Transfer to Delivery ward');
    }
    return '';
  }, [dispositionType]);

  if (dispositionType === 'ADMIT') return null;

  return (
    <div className={styles.wardPatientCardDispositionTypeContainer}>
      <Movement className={styles.movementIcon} size="24" />
      {message}
    </div>
  );
};

export default WardPatientTransfer;
