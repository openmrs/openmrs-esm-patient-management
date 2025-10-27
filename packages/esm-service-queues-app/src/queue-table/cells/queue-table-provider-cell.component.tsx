import React from 'react';
import { useSession } from '@openmrs/esm-framework';
import { Tag } from '@carbon/react';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';
import { useTranslation } from 'react-i18next';

export const QueueTableProviderCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { t } = useTranslation();
  const session = useSession();
  const currentProviderUuid = session?.currentProvider?.uuid;
  const assignedProvider = queueEntry.providerWaitingFor;

  if (!assignedProvider) {
    return (
      <>
        <Tag type="red" size="m" style={{ marginLeft: '0.5rem' }}>
          {t('noProviderAssigned', 'No Provider Assigned')}
        </Tag>
      </>
    );
  }

  const isAssignedToCurrentProvider = currentProviderUuid && assignedProvider.uuid === currentProviderUuid;
  const isAssignedToOtherProvider = currentProviderUuid && assignedProvider.uuid !== currentProviderUuid;

  return (
    <>
      {assignedProvider.display}
      {isAssignedToCurrentProvider ? (
        <Tag type="green" size="m" style={{ marginLeft: '0.5rem' }}>
          {t('you', 'You')}
        </Tag>
      ) : (
        <Tag type="blue" size="m" style={{ marginLeft: '0.5rem' }}>
          {t('assigned', 'Assigned')}
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
