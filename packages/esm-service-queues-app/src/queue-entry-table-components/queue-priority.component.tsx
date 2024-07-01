import React from 'react';
import { DefinitionTooltip, Tag } from '@carbon/react';
import styles from './queue-priority.scss';
import { type PriorityConfig } from '../config-schema';
import { type Concept } from '../types';
import classNames from 'classnames';

interface QueuePriorityProps {
  priority: Concept;
  priorityComment?: string;
  priorityConfigs: PriorityConfig[];
}

const QueuePriority: React.FC<QueuePriorityProps> = ({ priority, priorityComment, priorityConfigs }) => {
  const priorityConfig = priorityConfigs.find((c) => c.conceptUuid === priority.uuid);
  return (
    <>
      {priorityComment ? (
        <DefinitionTooltip className={styles.tooltip} align="bottom-left" definition={priorityComment}>
          <Tag
            role="tooltip"
            className={classNames(styles.tag, priorityConfig?.style === 'bold' && styles.bold)}
            type={priorityConfig?.color}>
            {priority.display}
          </Tag>
        </DefinitionTooltip>
      ) : (
        <Tag
          className={classNames(styles.tag, priorityConfig?.style === 'bold' && styles.bold)}
          type={priorityConfig?.color}>
          {priority.display}
        </Tag>
      )}
    </>
  );
};

export default QueuePriority;
