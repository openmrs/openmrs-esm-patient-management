import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { renderWithContext } from 'tools';
import { type Resources } from '../../../offline.resources';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { useAddressHierarchy, useOrderedAddressHierarchyLevels } from './address-hierarchy.resource';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { mockedAddressTemplate, mockedAddressOptions, mockedOrderedFields } from '__mocks__';
import { ResourcesContextProvider } from '../../../resources-context';
import { initialFormValues } from '../../patient-registration.component';
import { type FormValues } from '../../patient-registration.types';
import AddressSearchComponent from './address-search.component';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);
const mockUseAddressHierarchy = jest.mocked(useAddressHierarchy);
const mockUseOrderedAddressHierarchyLevels = jest.mocked(useOrderedAddressHierarchyLevels);

jest.mock('./address-hierarchy.resource', () => ({
  ...jest.requireActual('./address-hierarchy.resource'),
  useAddressHierarchy: jest.fn(),
  useOrderedAddressHierarchyLevels: jest.fn(),
}));

const allFields = mockedAddressTemplate.lines
  .flat()
  .filter((field) => field.isToken === 'IS_ADDR_TOKEN')
  .map(({ codeName, displayText }) => ({
    id: codeName,
    name: codeName,
    label: displayText,
  }));
const orderMap = Object.fromEntries(mockedOrderedFields.map((field, indx) => [field, indx]));
allFields.sort((existingField1, existingField2) => orderMap[existingField1.name] - orderMap[existingField2.name]);

/**
 * Helper to render AddressSearchComponent with Formik for state-dependent tests.
 */
async function renderAddressSearchWithFormik(
  initialValues: Partial<FormValues> = {},
  addressTemplate = mockedAddressTemplate,
) {
  const defaultValues = {
    address: {},
    ...initialValues,
  };

  let formValuesRef: FormValues = { ...initialFormValues, ...defaultValues } as FormValues;
  const mockResourcesContextValue = { addressTemplate } as unknown as Resources;

  const utils = await renderWithContext(
    <Formik initialValues={defaultValues} onSubmit={() => {}}>
      {({ setFieldValue, values }) => {
        formValuesRef = { ...initialFormValues, ...values } as FormValues;
        return (
          <Form>
            <PatientRegistrationContextProvider
              value={{
                identifierTypes: [],
                values: formValuesRef,
                validationSchema: null,
                inEditMode: false,
                setFieldValue: setFieldValue as any,
                setCapturePhotoProps: jest.fn(),
                setFieldTouched: jest.fn().mockResolvedValue(undefined),
                currentPhoto: '',
                isOffline: false,
                initialFormValues: formValuesRef,
              }}>
              <AddressSearchComponent addressLayout={allFields} />
            </PatientRegistrationContextProvider>
          </Form>
        );
      }}
    </Formik>,
    ResourcesContextProvider,
    mockResourcesContextValue,
  );

  return {
    ...utils,
    getFormValues: () => formValuesRef,
  };
}

describe('Testing address search bar', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(esmPatientRegistrationSchema),
      fieldConfigurations: {
        address: {
          useAddressHierarchy: {
            enabled: true,
            useQuickSearch: true,
            searchAddressByLevel: false,
          },
        },
      } as RegistrationConfig['fieldConfigurations'],
    });
    mockUseOrderedAddressHierarchyLevels.mockReturnValue({
      orderedFields: mockedOrderedFields,
      isLoadingFieldOrder: false,
      errorFetchingFieldOrder: null,
    });
  });

  it('renders the search bar', async () => {
    mockUseAddressHierarchy.mockReturnValue({
      addresses: [],
      error: null,
      isLoading: false,
    });

    await renderAddressSearchWithFormik();

    const searchbox = screen.getByRole('searchbox', { name: /search address/i });
    expect(searchbox).toBeInTheDocument();

    const ul = screen.queryByRole('list');
    expect(ul).not.toBeInTheDocument();
  });

  it('displays search results when user types a search term', async () => {
    const user = userEvent.setup();
    mockUseAddressHierarchy.mockReturnValue({
      addresses: mockedAddressOptions,
      error: null,
      isLoading: false,
    });

    await renderAddressSearchWithFormik();

    const searchbox = screen.getByRole('searchbox', { name: /search address/i });
    await user.type(searchbox, 'nea');

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0);
    });
  });

  it('updates form values when user selects an address option', async () => {
    const user = userEvent.setup();
    mockUseAddressHierarchy.mockReturnValue({
      addresses: mockedAddressOptions,
      error: null,
      isLoading: false,
    });

    const { getFormValues } = await renderAddressSearchWithFormik();

    const searchbox = screen.getByRole('searchbox', { name: /search address/i });
    await user.type(searchbox, 'nea');

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    // Find and click an address option
    const addressOptions = screen.getAllByRole('listitem');
    const firstOption = addressOptions[0];
    const addressText = firstOption.textContent || '';

    await user.click(firstOption);

    // Verify form values were updated
    const addressValues = addressText.split(' > ');
    for (let index = 0; index < allFields.length; index++) {
      const { name } = allFields[index];
      await waitFor(() => {
        const formValues = getFormValues();
        expect(formValues.address[name]).toBe(addressValues[index] || '');
      });
    }
  });

  it('clears search results when user clicks outside the component', async () => {
    const user = userEvent.setup();
    mockUseAddressHierarchy.mockReturnValue({
      addresses: mockedAddressOptions,
      error: null,
      isLoading: false,
    });

    await renderAddressSearchWithFormik();

    const searchbox = screen.getByRole('searchbox', { name: /search address/i });
    await user.type(searchbox, 'nea');

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    // Mock empty addresses when searchString is cleared
    mockUseAddressHierarchy.mockReturnValue({
      addresses: [],
      error: null,
      isLoading: false,
    });

    // Click outside - component listens for mousedown events
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });
  });

  it('clears search input when an address is selected', async () => {
    const user = userEvent.setup();
    mockUseAddressHierarchy.mockReturnValue({
      addresses: mockedAddressOptions,
      error: null,
      isLoading: false,
    });

    await renderAddressSearchWithFormik();

    const searchbox = screen.getByRole('searchbox', { name: /search address/i }) as HTMLInputElement;
    await user.type(searchbox, 'nea');

    await waitFor(() => {
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    const addressOptions = screen.getAllByRole('listitem');
    await user.click(addressOptions[0]);

    // Search input should be cleared
    await waitFor(() => {
      expect(searchbox.value).toBe('');
    });
  });
});
