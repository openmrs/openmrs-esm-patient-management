import React from 'react';
import { type VisitQueueEntry } from '../../active-visits/active-visits-table.resource';
import { Tag } from '@carbon/react';

// TODO: color code the Tag based on priority
const QueueTablePriorityCell = ({ queueEntry }: { queueEntry: VisitQueueEntry }) => {
  return <Tag>{queueEntry.queueEntry.priority.display}</Tag>;
};

export default QueueTablePriorityCell;
