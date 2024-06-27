import React from 'react';
import { ChemistryReference } from '@carbon/react/icons';
import type { WardPatientCardElement } from '../../types';
import styles from './row-elements.scss';
import { type PatientPendingOrdersElementConfig } from '../../config-schema';
import { useTranslation } from 'react-i18next';

const WardPatientPendingOrders = (config: PatientPendingOrdersElementConfig) => {
  const { t } = useTranslation();
  // TODO count pending orders given order types
  const WardPatientPendingOrders: WardPatientCardElement = ({ patient }) => {
    return (
      <div className={styles.waitingForItemContainer}>
        <ChemistryReference className={styles.chemistryReferenceIcon} size="24" />
        {t('labs', '{{count}} Labs', { count: 2 })}
      </div>
    );
  };

  return WardPatientPendingOrders;
};

export default WardPatientPendingOrders;
