import React from 'react';
import { Group, InProgress } from '@carbon/react/icons';

function StatusIcon({ statusStyle }) {
  switch (statusStyle?.iconComponent) {
    case 'InProgress':
      return <InProgress size={16} />;
    case 'Group':
      return <Group size={16} />;
    default:
      return null;
  }
}

export default StatusIcon;
