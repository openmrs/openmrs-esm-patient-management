import React from 'react';
import { DefinitionTooltip, Tag } from '@carbon/react';
import styles from './queue-priority.scss';
import { type ConfigObject } from '../config-schema';
import { type Concept } from '../types';
import { useConfig } from '@openmrs/esm-framework';

interface QueuePriorityProps {
  priority: Concept;
  priorityComment?: string;
}

const QueuePriority: React.FC<QueuePriorityProps> = ({ priority, priorityComment }) => {
  const { priorityConfigs } = useConfig<ConfigObject>();
  const priorityConfig = priorityConfigs.find((c) => c.conceptUuid === priority.uuid);
  return (
    <>
      {priorityComment ? (
        <DefinitionTooltip className={styles.tooltip} align="bottom-left" definition={priorityComment}>
          <Tag
            role="tooltip"
            className={priorityConfig?.tagClassName === 'priorityTag' ? styles.priorityTag : styles.tag}
            type={priorityConfig?.tagType ?? 'gray'}>
            {priority.display}
          </Tag>
        </DefinitionTooltip>
      ) : (
        <Tag
          className={priorityConfig?.tagClassName === 'priorityTag' ? styles.priorityTag : styles.tag}
          type={priorityConfig?.tagType ?? 'gray'}>
          {priority.display}
        </Tag>
      )}
    </>
  );
};

export default QueuePriority;
