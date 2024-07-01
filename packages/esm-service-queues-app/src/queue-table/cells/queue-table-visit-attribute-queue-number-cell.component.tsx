import React from 'react';
import { type VisitAttributeQueueNumberColumnConfig } from '../../config-schema';
import { type QueueTableColumnFunction, type QueueEntry, type QueueTableCellComponentProps } from '../../types';
import { InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';

export const queueTableVisitAttributeQueueNumberColumn: QueueTableColumnFunction = (
  key,
  header,
  { visitQueueNumberAttributeUuid }: VisitAttributeQueueNumberColumnConfig,
) => {
  function getVisitQueueNumber(queueEntry: QueueEntry) {
    return queueEntry.visit?.attributes?.find((e) => e?.attributeType?.uuid === visitQueueNumberAttributeUuid)?.value;
  }

  const QueueTableVisitAttributeQueueNumberCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    const { t } = useTranslation();
    return (
      <>
        {visitQueueNumberAttributeUuid ? (
          <span>{getVisitQueueNumber(queueEntry)}</span>
        ) : (
          <InlineNotification lowContrast hideCloseButton>
            {t('visitQueueNumberAttributeUuid not configured', 'visitQueueNumberAttributeUuid not configured')}
          </InlineNotification>
        )}
      </>
    );
  };

  return {
    key,
    header,
    CellComponent: QueueTableVisitAttributeQueueNumberCell,
    getFilterableValue: getVisitQueueNumber,
  };
};
