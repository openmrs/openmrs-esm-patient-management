import React from 'react';
import { Tag } from '@carbon/react';
import { type QueueEntry } from '../../types';

// TODO: color code the Tag based on priority
const QueueTablePriorityCell = ({ queueEntry }: { queueEntry: QueueEntry }) => {
  return <Tag>{queueEntry.priority.display}</Tag>;
};

export default QueueTablePriorityCell;
