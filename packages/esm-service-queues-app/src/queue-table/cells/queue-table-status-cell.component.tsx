import React from 'react';
import { type VisitQueueEntry } from '../../active-visits/active-visits-table.resource';

const QueueTableStatusCell = ({ queueEntry }: { queueEntry: VisitQueueEntry }) => {
  return <>{queueEntry.queueEntry.status.display}</>;
};

export default QueueTableStatusCell;
