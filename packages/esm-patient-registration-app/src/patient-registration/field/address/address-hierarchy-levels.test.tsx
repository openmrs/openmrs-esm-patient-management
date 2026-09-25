import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { Formik, useFormikContext } from 'formik';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { type Resources } from '../../../registration.resource';
import { type AddressTemplate } from '../../patient-registration.types';
import {
  PatientRegistrationContextProvider,
  type PatientRegistrationContextProps,
} from '../../patient-registration-context';
import { ResourcesContextProvider } from '../../../resources-context';
import { AddressComponent } from './address-field.component';

/**
 * Regression test for O3-5912.
 *
 * A stubbed patient registration provider previously shadowed the real `setFieldValue`, so
 * changing a parent left dependent fields populated. These tests render the real AddressComponent,
 * drive the real combo inputs, and assert on the resulting Formik values. Nothing in the hierarchy
 * hooks is mocked: the data comes from `openmrsFetch`.
 */

const mockUseConfig = vi.mocked(useConfig<RegistrationConfig>);
const mockOpenmrsFetch = vi.mocked(openmrsFetch);

const addressTemplate = {
  lines: [
    [
      { isToken: 'IS_ADDR_TOKEN', displayText: 'Country', codeName: 'country' },
      { isToken: 'IS_ADDR_TOKEN', displayText: 'State/Province', codeName: 'stateProvince' },
      { isToken: 'IS_ADDR_TOKEN', displayText: 'City/Village', codeName: 'cityVillage' },
    ],
  ],
  requiredElements: [],
} as unknown as AddressTemplate;

const resources = {
  addressTemplate,
  currentSession: mockSession.data,
  identifierTypes: [],
  relationshipTypes: { results: [] },
} as Resources;

const levels = ['country', 'stateProvince', 'cityVillage'];

// Keyed by the `searchString` the app sends: the selected parent values joined with "|".
const hierarchy: Record<string, Array<string>> = {
  '': ['Kenya', 'Uganda'],
  Kenya: ['Nairobi', 'Mombasa'],
  Uganda: ['Kampala', 'Wakiso'],
  'Kenya|Nairobi': ['Westlands', 'Kibera'],
};

function AddressValues() {
  const { values } = useFormikContext<{ address: Record<string, string> }>();
  return <output data-testid="address-values">{JSON.stringify(values.address)}</output>;
}

function getAddressValues() {
  return JSON.parse(screen.getByTestId('address-values').textContent ?? '{}');
}

function renderAddress() {
  const contextValue = { setFieldValue: vi.fn(), values: {} } as unknown as PatientRegistrationContextProps;

  return render(
    // A fresh SWR cache per render, so hierarchy responses do not leak between tests.
    <SWRConfig value={{ provider: () => new Map() }}>
      <ResourcesContextProvider value={resources}>
        <PatientRegistrationContextProvider value={contextValue}>
          <Formik initialValues={{ address: {} }} onSubmit={() => {}}>
            <>
              <AddressComponent />
              <AddressValues />
            </>
          </Formik>
        </PatientRegistrationContextProvider>
      </ResourcesContextProvider>
    </SWRConfig>,
  );
}

async function choose(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  const input = await screen.findByLabelText(label);
  await user.clear(input);
  await user.click(input);
  await user.click(await screen.findByText(option));
}

describe('Address hierarchy: clearing dependent fields', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: true,
            useQuickSearch: false,
            searchAddressByLevel: true,
          },
        },
      } as RegistrationConfig['fieldConfigurations'],
      fieldDefinitions: [],
    });

    mockOpenmrsFetch.mockImplementation(((url: string) => {
      if (url.includes('getOrderedAddressHierarchyLevels')) {
        return Promise.resolve({ data: levels.map((addressField) => ({ addressField })) });
      }

      if (url.includes('getChildAddressHierarchyEntries')) {
        const searchString = new URL(url, 'http://localhost/').searchParams.get('searchString') ?? '';
        return Promise.resolve({ data: (hierarchy[searchString] ?? []).map((name) => ({ name })) });
      }

      return Promise.resolve({ data: [] });
    }) as unknown as typeof openmrsFetch);
  });

  it('clears every dependent level when the country changes', async () => {
    const user = userEvent.setup();
    renderAddress();

    await choose(user, 'Country (optional)', 'Kenya');
    await choose(user, 'State/Province (optional)', 'Nairobi');
    await choose(user, 'City/Village (optional)', 'Westlands');

    await waitFor(() =>
      expect(getAddressValues()).toEqual({ country: 'Kenya', stateProvince: 'Nairobi', cityVillage: 'Westlands' }),
    );

    await choose(user, 'Country (optional)', 'Uganda');

    await waitFor(() => expect(getAddressValues()).toEqual({ country: 'Uganda', stateProvince: '', cityVillage: '' }));
  });

  it('clears only the levels below a changed parent and keeps the selected parent value', async () => {
    const user = userEvent.setup();
    renderAddress();

    await choose(user, 'Country (optional)', 'Kenya');
    await choose(user, 'State/Province (optional)', 'Nairobi');
    await choose(user, 'City/Village (optional)', 'Westlands');

    await waitFor(() =>
      expect(getAddressValues()).toEqual({ country: 'Kenya', stateProvince: 'Nairobi', cityVillage: 'Westlands' }),
    );

    await choose(user, 'State/Province (optional)', 'Mombasa');

    await waitFor(() =>
      expect(getAddressValues()).toEqual({ country: 'Kenya', stateProvince: 'Mombasa', cityVillage: '' }),
    );
  });

  it('does not clear other fields or fetch entries when searchAddressByLevel is disabled', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: true,
            useQuickSearch: false,
            searchAddressByLevel: false,
          },
        },
      } as RegistrationConfig['fieldConfigurations'],
      fieldDefinitions: [],
    });

    const user = userEvent.setup();
    renderAddress();

    await user.type(await screen.findByLabelText('State/Province (optional)'), 'Nairobi');
    await user.type(screen.getByLabelText('Country (optional)'), 'Kenya');

    await waitFor(() => expect(getAddressValues()).toEqual({ stateProvince: 'Nairobi', country: 'Kenya' }));

    await user.clear(screen.getByLabelText('Country (optional)'));
    await user.type(screen.getByLabelText('Country (optional)'), 'Uganda');

    await waitFor(() => expect(getAddressValues()).toEqual({ stateProvince: 'Nairobi', country: 'Uganda' }));
    expect(mockOpenmrsFetch).not.toHaveBeenCalledWith(expect.stringContaining('getChildAddressHierarchyEntries'));
  });
});
