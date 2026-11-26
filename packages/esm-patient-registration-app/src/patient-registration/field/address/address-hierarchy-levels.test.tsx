import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SWRConfig } from 'swr';
import { getDefaultsFromConfigSchema, openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { mockSession } from '__mocks__';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { ResourcesContextProvider } from '../../../resources-context';
import { renderWithRegistrationForm } from '../../../test-utils/render-with-registration-form';
import { Input } from '../../input/basic-input/input/input.component';
import { AddressComponent } from './address-field.component';
import type { Resources } from '../../../registration.resource';
import type { AddressTemplate, FormValues } from '../../patient-registration.types';

/**
 * Regression test for O3-5912.
 *
 * These tests render the real AddressComponent, drive the real combo inputs, and assert on the
 * resulting form values. Nothing in the hierarchy hooks is mocked: the data comes from `openmrsFetch`.
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

let getValues: () => FormValues;

function getAddressValues() {
  return getValues().address;
}

function renderAddress(initialAddress: Partial<FormValues['address']> = {}) {
  const utils = renderWithRegistrationForm(
    // A fresh SWR cache per render, so hierarchy responses do not leak between tests.
    <SWRConfig value={{ provider: () => new Map() }}>
      <ResourcesContextProvider value={resources}>
        <AddressComponent />
      </ResourcesContextProvider>
    </SWRConfig>,
    { initialValues: { address: initialAddress as FormValues['address'] } },
  );
  getValues = utils.getValues;
  return utils;
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

  it('touches the level when its input loses focus', async () => {
    const user = userEvent.setup();
    const { getTouched } = renderAddress();

    await user.click(await screen.findByLabelText('Country (optional)'));
    expect(getTouched().address?.country).toBeFalsy();

    await user.click(document.body);

    await waitFor(() => expect(getTouched().address?.country).toBe(true));
  });

  it('does not clear the dependent levels when the same parent value is selected again', async () => {
    const user = userEvent.setup();
    renderAddress();

    await choose(user, 'Country (optional)', 'Kenya');
    await choose(user, 'State/Province (optional)', 'Nairobi');
    await choose(user, 'City/Village (optional)', 'Westlands');

    await waitFor(() =>
      expect(getAddressValues()).toEqual({ country: 'Kenya', stateProvince: 'Nairobi', cityVillage: 'Westlands' }),
    );

    const countryInput = screen.getByLabelText('Country (optional)');
    await user.click(countryInput);
    await user.click(await screen.findByText('Kenya'));

    expect(getAddressValues()).toEqual({ country: 'Kenya', stateProvince: 'Nairobi', cityVillage: 'Westlands' });
  });

  it('fetches the child entries for the new parent after the parent changes', async () => {
    const user = userEvent.setup();
    renderAddress();

    await choose(user, 'Country (optional)', 'Kenya');
    await user.click(await screen.findByLabelText('State/Province (optional)'));
    expect(await screen.findByText('Nairobi')).toBeInTheDocument();

    await choose(user, 'Country (optional)', 'Uganda');
    await user.click(screen.getByLabelText('State/Province (optional)'));

    expect(await screen.findByText('Kampala')).toBeInTheDocument();
    expect(screen.queryByText('Nairobi')).not.toBeInTheDocument();
    expect(mockOpenmrsFetch).toHaveBeenCalledWith(
      expect.stringContaining('getChildAddressHierarchyEntries.form?searchString=Uganda'),
    );
  });

  it('shows the form value of each level in its input', async () => {
    renderAddress({ country: 'Kenya', stateProvince: 'Nairobi' });

    expect(await screen.findByLabelText('Country (optional)')).toHaveValue('Kenya');
    expect(screen.getByLabelText('State/Province (optional)')).toHaveValue('Nairobi');
    expect(screen.getByLabelText('City/Village (optional)')).toHaveValue('');
  });

  it('does not load or report the level entries again when another field changes', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOpenmrsFetch.mockImplementation(((url: string) => {
      if (url.includes('getOrderedAddressHierarchyLevels')) {
        return Promise.resolve({ data: levels.map((addressField) => ({ addressField })) });
      }
      return Promise.reject(new Error('Address hierarchy is down'));
    }) as unknown as typeof openmrsFetch);
    const user = userEvent.setup();
    renderWithRegistrationForm(
      <SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
        <ResourcesContextProvider value={resources}>
          <Input id="givenName" name="givenName" labelText="Given name" />
          <AddressComponent />
        </ResourcesContextProvider>
      </SWRConfig>,
      {
        initialValues: { givenName: '', address: {} } as Partial<FormValues>,
        withValidation: true,
        config: {
          freeTextFieldConceptUuid: 'free-text-uuid',
          fieldConfigurations: {
            gender: [{ label: 'M', value: 'male' }],
            identifier: { allowPreferredSelection: false },
          },
        } as unknown as RegistrationConfig,
      },
    );
    await screen.findByLabelText('Country (optional)');
    await waitFor(() => expect(consoleError).toHaveBeenCalled());
    const fetchesBefore = mockOpenmrsFetch.mock.calls.length;
    const errorsBefore = consoleError.mock.calls.length;

    await user.type(screen.getByRole('textbox', { name: /Given name/i }), 'abc');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockOpenmrsFetch.mock.calls.length).toBe(fetchesBefore);
    expect(consoleError.mock.calls.length).toBe(errorsBefore);
    consoleError.mockRestore();
  });
});
