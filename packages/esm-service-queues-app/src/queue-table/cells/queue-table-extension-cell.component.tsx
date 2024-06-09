import React from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';

export const queueTableExtensionColumn: QueueTableColumnFunction = (key, header) => {
  const QueueTableExtensionCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    return <ExtensionSlot name={`queue-table-${key}-slot`} state={{ queueEntry }} />;
  };

  return {
    key,
    header,
    CellComponent: QueueTableExtensionCell,
    getFilterableValue: null,
  };
};
