import React from 'react';
import { ChemistryReference } from '@carbon/react/icons';
import type { WardPatientCardProps } from '../../types';
import styles from './row-elements.scss';
import { type PatientPendingOrdersElementConfig } from '../../config-schema';
import { useTranslation } from 'react-i18next';
import { usePatientOrders } from '@openmrs/esm-patient-common-lib';
import { SkeletonIcon } from '@carbon/react';
import { useCountTestOrdersWithoutObs } from '../../hooks/usePatientPendingOrders';

interface WardPatientPendingOrdersProps extends WardPatientCardProps {
  orderType: string;
}

const WardPatientPendingOrdersItem: React.FC<WardPatientPendingOrdersProps> = ({ patient, orderType }) => {
  const { t } = useTranslation();
  const { data: orders, error: isError, isLoading } = usePatientOrders(patient.uuid, 'ACTIVE', orderType);
  const { count, isLoading: countingOrdersWithoutObs } = useCountTestOrdersWithoutObs(orders || []);

  if (count === 0) return null;

  return (
    <div className={styles.waitingForItemContainer}>
      {isLoading || countingOrdersWithoutObs ? (
        <SkeletonIcon />
      ) : (
        <>
          <ChemistryReference className={styles.chemistryReferenceIcon} size="24" />
          {t('labs', '{{count}} Labs', { count })}
        </>
      )}
    </div>
  );
};

const WardPatientPendingOrders: React.FC<PatientPendingOrdersElementConfig & WardPatientCardProps> = (props) => {
  const { types: orderTypes, ...restProps } = props;

  return (
    <>
      {orderTypes.map((orderType) => (
        <WardPatientPendingOrdersItem key={orderType} orderType={orderType} {...restProps} />
      ))}
    </>
  );
};

export default WardPatientPendingOrders;
