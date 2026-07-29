import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { type ConfigObject, configSchema } from '../../config-schema';
import { type OrderItem } from '../../types/index';
import Medications from './medications-list.component';

const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const configDefaults = getDefaultsFromConfigSchema<ConfigObject>(configSchema);

const labOrderTypeUuid = '52a447d3-a64a-11e3-9aeb-50e549534c5e';

function buildOrderItem(uuid: string, orderTypeUuid: string, drugDisplay: string): OrderItem {
  return {
    order: {
      uuid,
      action: 'NEW',
      dose: 1,
      drug: { uuid: `${uuid}-drug`, name: drugDisplay, display: drugDisplay, strength: '' },
      orderType: { uuid: orderTypeUuid, display: 'Renamed order type' },
    },
    provider: { name: 'Dr. Test', role: 'Clinician' },
    time: '10:00 AM',
  } as unknown as OrderItem;
}

describe('Medications list', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(configDefaults);
  });

  it('renders only orders whose orderType.uuid matches the configured drugOrderTypeUuid', () => {
    render(
      <Medications
        medications={[
          buildOrderItem('drug-order', configDefaults.drugOrderTypeUuid, 'aspirin'),
          buildOrderItem('lab-order', labOrderTypeUuid, 'complete-blood-count'),
        ]}
      />,
    );

    expect(screen.getByText('Aspirin')).toBeInTheDocument();
    expect(screen.queryByText('Complete-blood-count')).not.toBeInTheDocument();
  });
});
