import { Tag } from '@carbon/react';
import React from 'react';
import { type QueueTableColumn, type QueueTableCellComponentProps } from '../../types';

// TODO: color code the Tag based on priority
const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <Tag>{queueEntry.priority.display}</Tag>;
};

export const queueTablePriorityColumn: QueueTableColumn = {
  headerI18nKey: 'priority',
  CellComponent: QueueTablePriorityCell,
};
