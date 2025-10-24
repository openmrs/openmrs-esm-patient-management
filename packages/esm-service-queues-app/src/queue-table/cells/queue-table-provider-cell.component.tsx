import React from 'react';
import { useSession } from '@openmrs/esm-framework';
import { Tag } from '@carbon/react';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const QueueTableProviderCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const session = useSession();
  const currentProviderUuid = session?.currentProvider?.uuid;
  const assignedProvider = queueEntry.providerWaitingFor;

  if (!assignedProvider) {
    return <>--</>;
  }

  const isAssignedToCurrentProvider = currentProviderUuid && assignedProvider.uuid === currentProviderUuid;
  const isAssignedToOtherProvider = currentProviderUuid && assignedProvider.uuid !== currentProviderUuid;

  return (
    <>
      {assignedProvider.display}
      {isAssignedToCurrentProvider && (
        <Tag type="green" size="sm" style={{ marginLeft: '0.5rem' }}>
          You
        </Tag>
      )}
      {isAssignedToOtherProvider && (
        <Tag type="blue" size="sm" style={{ marginLeft: '0.5rem' }}>
          Assigned
        </Tag>
      )}
    </>
  );
};

export const queueTableProviderColumn: QueueTableColumnFunction = (key, header) => ({
  key,
  header,
  CellComponent: QueueTableProviderCell,
  getFilterableValue: (queueEntry) => {
    return queueEntry.providerWaitingFor?.display ?? null;
  },
});
