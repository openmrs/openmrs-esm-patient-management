import React from 'react';
import { type QueueEntry } from '../../types';

const QueueTableStatusCell = ({ queueEntry }: { queueEntry: QueueEntry }) => {
  return <>{queueEntry.status.display}</>;
};

export default QueueTableStatusCell;
