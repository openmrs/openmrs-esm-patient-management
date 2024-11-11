import { Hourglass } from '@carbon/react/icons';
import React, { useCallback, useEffect } from 'react';
import { type WardPatient } from '../../types';

import { useElementConfig } from '../../ward-view/ward-view.resource';
import { WardPatientPendingOrder } from '../row-elements/ward-patient-pending-order.component';
import WardPatientPendingTransfer from '../row-elements/ward-patient-pending-transfer';
import styles from '../ward-patient-card.scss';

export interface PendingItemsRowProps {
  id: string;
  wardPatient: WardPatient;
}

const PendingItemsRow: React.FC<PendingItemsRowProps> = ({ id, wardPatient }) => {
  const { orders, showPendingItems } = useElementConfig('pendingItems', id);
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

export default PendingItemsRow;
