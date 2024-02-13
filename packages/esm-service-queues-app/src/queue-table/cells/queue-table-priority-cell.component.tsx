import { Tag } from '@carbon/react';
import React from 'react';
import { type QueueTableCellComponentProps } from '../../types';

// TODO: color code the Tag based on priority
const QueueTablePriorityCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <Tag>{queueEntry.priority.display}</Tag>;
};

export default QueueTablePriorityCell;
