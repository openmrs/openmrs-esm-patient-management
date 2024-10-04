import React, { useCallback, useEffect } from 'react';
import { type WardPatientCard } from '../../types';
import { Hourglass } from '@carbon/react/icons';

import { useConfig } from '@openmrs/esm-framework';
import type { PendingItemsDefinition } from '../../config-schema';
import { WardPatientPendingOrder } from '../row-elements/ward-patient-pending-order.component';
import styles from '../ward-patient-card.scss';
import WardPatientPendingTransfer from '../row-elements/ward-patient-pending-transfer';

const PendingItemsCarRowExtension: WardPatientCard = (wardPatient) => {
  const { orders, showPendingItems } = useConfig<PendingItemsDefinition>();
  const [hasPendingOrders, setHasPendingOrders] = React.useState(false);

  const hasPendingItems = !!wardPatient?.inpatientRequest || hasPendingOrders;

  const handlePendingOrderCount = useCallback((count: number) => {
    if (count > 0) {
      setHasPendingOrders(true);
    }
  }, []);

  useEffect(() => {
    if (!orders?.orderTypes?.length) {
      setHasPendingOrders(false);
    }
  }, [orders]);

  return (
    <div className={styles.wardPatientCardPendingItemsRow}>
      {showPendingItems && hasPendingItems ? (
        <>
          <Hourglass className={styles.hourGlassIcon} size="16" />:
        </>
      ) : null}
      {orders?.orderTypes.map(({ uuid, label }) => (
        <WardPatientPendingOrder
          key={`pending-order-type-${uuid}`}
          wardPatient={wardPatient}
          orderUuid={uuid}
          label={label}
          onOrderCount={handlePendingOrderCount}
        />
      ))}
      {wardPatient?.inpatientRequest ? <WardPatientPendingTransfer wardPatient={wardPatient} /> : null}
    </div>
  );
};

export default PendingItemsCarRowExtension;
