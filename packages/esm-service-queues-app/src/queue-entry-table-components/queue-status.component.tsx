import React from 'react';
import { Group, InProgress } from '@carbon/react/icons';
import styles from '../active-visits/active-visits-table.scss';
import { type Concept, type Queue } from '../types';
import { useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, type StatusConfig } from '../config-schema';

interface QueueStatusProps {
  status: Concept;
  queue?: Queue;
}

const QueueStatus: React.FC<QueueStatusProps> = ({ status, queue }) => {
  const { statusConfigs } = useConfig<ConfigObject>();
  const statusConfig = statusConfigs.find((c) => c.conceptUuid === status.uuid);
  return (
    <span className={styles.statusContainer}>
      <StatusIcon statusConfig={statusConfig} />
      <span>
        {status.display}
        {queue ? ' - ' + queue.display : ''}
      </span>
    </span>
  );
};

interface StatusIconProps {
  statusConfig?: StatusConfig;
}

const StatusIcon: React.FC<StatusIconProps> = ({ statusConfig }) => {
  return (
    <span>
      {statusConfig?.iconComponent === 'InProgress' && <InProgress size={16} />}
      {statusConfig?.iconComponent === 'Group' && <Group size={16} />}
    </span>
  );
};

export default QueueStatus;
