import React from 'react';
import { Movement } from '@carbon/react/icons';
import type { WardPatientCardElement } from '../../types';
import styles from './row-elements.scss';
import { useTranslation } from 'react-i18next';

const WardPatientTransfer: WardPatientCardElement = () => {
  const { t } = useTranslation();
  // TODO update the transfer details by the active disposition
  return (
    <div className={styles.waitingForItemContainer}>
      <Movement className={styles.movementIcon} size="24" />
      {t('transferToDeliveryWard', 'Transfer to Delivery ward')}
    </div>
  );
};

export default WardPatientTransfer;
