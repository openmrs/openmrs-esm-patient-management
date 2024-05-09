import React from 'react';
import { useRenderableExtensions } from '@openmrs/esm-framework';
import { type QueueTableColumnFunction, type QueueTableCellComponentProps } from '../../types';
import { type ExtensionColumnConfig } from '../../config-schema';

export const queueTableExtensionColumn: QueueTableColumnFunction = (key, header, config: ExtensionColumnConfig) => {
  const state = config?.state ?? {};

  const QueueTableExtensionCell = ({ queueEntry }: QueueTableCellComponentProps) => {
    const extensions = useRenderableExtensions('queue-table-extension-column-slot');

    return (
      <>
        {extensions.map((Ext, index) => (
          <React.Fragment key={index}>
            <Ext state={{ queueEntry, ...state }} />
          </React.Fragment>
        ))}
      </>
    );
  };

  return {
    key,
    header,
    CellComponent: QueueTableExtensionCell,
    getFilterableValue: null,
  };
};
