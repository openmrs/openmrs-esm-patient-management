import React from 'react';
import { useSession } from '@openmrs/esm-framework';
import { Tag } from '@carbon/react';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';
import { useTranslation } from 'react-i18next';
import styles from './queue-table-provider-cell.scss';

export const QueueTableProviderCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  const { t } = useTranslation();
  const session = useSession();
  const currentProviderUuid = session?.currentProvider?.uuid;
  const assignedProvider = queueEntry.providerWaitingFor;

  if (!assignedProvider) {
    return (
      <Tag type="red" size="m" className={styles.tagWithMargin}>
        {t('noProviderAssigned', 'No Provider Assigned')}
      </Tag>
    );
  }

  const isAssignedToCurrentProvider = currentProviderUuid && assignedProvider.uuid === currentProviderUuid;

  return (
    <>
      {assignedProvider.display}
      {isAssignedToCurrentProvider ? (
        <Tag type="green" size="m" className={styles.tagWithMargin}>
          {t('you', 'You')}
        </Tag>
      ) : (
        <Tag type="blue" size="m" className={styles.tagWithMargin}>
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
