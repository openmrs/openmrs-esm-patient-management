import React from 'react';
import { DefinitionTooltip, Tag } from '@carbon/react';
import styles from './priority-tag.scss';
import { type PriorityStyle } from '../types';
import { type MappedVisitQueueEntry } from '../active-visits/active-visits-table.resource';

interface PriorityTagProps {
  entry: MappedVisitQueueEntry;
  priorityStyle: PriorityStyle;
}

const PriorityTag: React.FC<PriorityTagProps> = ({ entry, priorityStyle }) => {
  return (
    <>
      {entry.priorityComment ? (
        <DefinitionTooltip className={styles.tooltip} align="bottom-left" definition={entry.priorityComment}>
          <Tag
            role="tooltip"
            className={priorityStyle?.styleComponent === 'priorityTag' ? styles.priorityTag : styles.tag}
            type={priorityStyle?.tagType ?? 'gray'}>
            {entry.priorityComment}
          </Tag>
        </DefinitionTooltip>
      ) : (
        <Tag
          className={priorityStyle?.styleComponent === 'priorityTag' ? styles.priorityTag : styles.tag}
          type={priorityStyle?.tagType ?? 'gray'}>
          {entry.priorityDisplay}
        </Tag>
      )}
    </>
  );
};

export default PriorityTag;
