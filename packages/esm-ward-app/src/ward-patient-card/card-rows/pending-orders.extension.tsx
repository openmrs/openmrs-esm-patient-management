import React from 'react';
import { type WardPatientCard } from '../../types';
import { useConfig } from '@openmrs/esm-framework';
import type { PendingOrderTypesDefinition } from '../../config-schema';
import { WardPatientPendingOrder } from '../row-elements/ward-patient-pending-order.component';

const PendingOrdersExtension: WardPatientCard = (wardPatient) => {
  const { orderTypes, enabled } = useConfig<PendingOrderTypesDefinition>();

  if (!enabled || !orderTypes) {
    return <></>;
  }

  return (
    <>
      {orderTypes.map(({ uuid, label }) => (
        <WardPatientPendingOrder
          key={`pending-order-type-${uuid}`}
          wardPatient={wardPatient}
          orderUuid={uuid}
          label={label}
        />
      ))}
    </>
  );
};

export default PendingOrdersExtension;
