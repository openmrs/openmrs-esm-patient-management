import React from 'react';
import { Group, InProgress } from '@carbon/react/icons';

function StatusIcon({ status }) {
  switch (status) {
    case 'waiting':
      return <InProgress size={16} />;
    case 'in service':
      return <Group size={16} />;
    case 'finished service':
      return <Group size={16} />;
    default:
      return null;
  }
}

export default StatusIcon;
