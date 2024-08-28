import React from 'react';
import { ChemistryReference } from '@carbon/react/icons';
import styles from '../ward-patient-card.scss';
import { useTranslation } from 'react-i18next';
import { type WardPatient } from '../../types';
import { usePatientPendingOrders } from '../../hooks/usePatientPendingOrders';

export interface WardPatientPendingOrderProps {
  wardPatient: WardPatient;
  orderUuid: string;
  label: string;
}

export const WardPatientPendingOrder: React.FC<WardPatientPendingOrderProps> = ({ wardPatient, orderUuid, label }) => {
  const { t } = useTranslation();
  const { count, isLoading } = usePatientPendingOrders(
    wardPatient?.patient?.uuid,
    orderUuid,
    wardPatient?.visit?.startDatetime.split('T')[0],
  );

  if (isLoading || !count || count == 0) {
    return null;
  }

  const labelToDisplay = label ? t(label) : t('Orders', 'Orders');
  return (
    <div className={styles.wardPatientCardDispositionTypeContainer}>
      <ChemistryReference className={styles.chemistryReferenceIcon} size="24" />
      {count} {labelToDisplay}
    </div>
  );
};
