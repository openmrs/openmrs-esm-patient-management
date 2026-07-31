import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { mockQueueEntryBrian, mockStatusWaiting } from '__mocks__';
import { configSchema, type ConfigObject } from '../../config-schema';
import { queueTableActionColumn } from './queue-table-action-cell.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const configDefaults = getDefaultsFromConfigSchema<ConfigObject>(configSchema);

describe('queueTableActionColumn', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...configDefaults,
      concepts: { ...configDefaults.concepts, waitingStatusConceptUuid: mockStatusWaiting.uuid },
    } as ConfigObject);
  });

  // Only the mocked waitingStatusConceptUuid matches Brian's status, so this pins `call` to the waiting
  // status rather than defaultStatusConceptUuid, which it used to compare against.
  it('shows the Call action for an entry in the waiting status', () => {
    const { CellComponent } = queueTableActionColumn('actions', 'Actions', {
      actions: { buttons: ['call'], overflowMenu: [] },
    });
    render(<CellComponent queueEntry={mockQueueEntryBrian} queueEntryUuid={mockQueueEntryBrian.uuid} />);

    expect(screen.getByRole('button', { name: 'Call' })).toBeInTheDocument();
  });
});
