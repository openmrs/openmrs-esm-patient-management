import React from 'react';
import { type QueueTableCellComponentProps } from '../../types';

const QueueTableStatusCell = ({ queueEntry }: QueueTableCellComponentProps) => {
  return <>{queueEntry.status.display}</>;
};

export default QueueTableStatusCell;
