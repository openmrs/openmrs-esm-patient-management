import React from 'react';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { Formik, Form, useFormikContext } from 'formik';
import { renderWithContext } from 'tools';
import { type Resources } from '../../../offline.resources';
import { PatientRegistrationContextProvider } from '../../patient-registration-context';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { useAddressHierarchy, useOrderedAddressHierarchyLevels } from './address-hierarchy.resource';
import { type RegistrationConfig, esmPatientRegistrationSchema } from '../../../config-schema';
import { mockedAddressTemplate, mockedAddressOptions, mockedOrderedFields } from '__mocks__';
import { ResourcesContextProvider } from '../../../resources-context';
import AddressSearchComponent from './address-search.component';

const mockUseConfig = jest.mocked(useConfig<RegistrationConfig>);
const mockUseAddressHierarchy = jest.mocked(useAddressHierarchy);
const mockUseOrderedAddressHierarchyLevels = jest.mocked(useOrderedAddressHierarchyLevels);
const mockUseFormikContext = useFormikContext as jest.Mock;

jest.mock('./address-hierarchy.resource', () => ({
  ...(jest.requireActual('./address-hierarchy.resource') as jest.Mock),
  useAddressHierarchy: jest.fn(),
  useOrderedAddressHierarchyLevels: jest.fn(),
}));

jest.mock('../../patient-registration.resource', () => ({
  ...(jest.requireActual('../../../patient-registration.resource') as jest.Mock),
  useAddressHierarchy: jest.fn(),
}));

jest.mock('formik', () => ({
  ...(jest.requireActual('formik') as jest.Mock),
  useFormikContext: jest.fn(() => ({})),
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

async function renderAddressHierarchy(addressTemplate = mockedAddressTemplate) {
  const mockResourcesContextValue = { addressTemplate } as unknown as Resources;

  await renderWithContext(
    <Formik initialValues={{}} onSubmit={null}>
      <Form>
        <PatientRegistrationContextProvider value={{ setFieldValue: jest.fn() } as any}>
          <AddressSearchComponent addressLayout={allFields} />
        </PatientRegistrationContextProvider>
      </Form>
    </Formik>,
    ResourcesContextProvider,
    mockResourcesContextValue,
  );
}

const setFieldValue = jest.fn();

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
    mockUseFormikContext.mockReturnValue({
      setFieldValue,
    });
  });

  it('should render the search bar', () => {
    mockUseAddressHierarchy.mockReturnValue({
      addresses: [],
      error: null,
      isLoading: false,
    });

    renderAddressHierarchy();

    const searchbox = screen.getByRole('searchbox');
    expect(searchbox).toBeInTheDocument();

    const ul = screen.queryByRole('list');
    expect(ul).not.toBeInTheDocument();
  });

  it("should render only the results for the search term matched address' parents", async () => {
    const user = userEvent.setup();

    mockUseAddressHierarchy.mockReturnValue({
      addresses: mockedAddressOptions,
      error: null,
      isLoading: false,
    });

    renderAddressHierarchy();

    const searchString = 'nea';
    const separator = ' > ';
    const options: Set<string> = new Set();

    mockedAddressOptions.forEach((address) => {
      const values = address.split(separator);
      values.forEach((val, index) => {
        if (val.toLowerCase().includes(searchString.toLowerCase())) {
          options.add(values.slice(0, index + 1).join(separator));
        }
      });
    });

    const addressOptions = [...options];
    addressOptions.forEach(async (address) => {
      const optionElement = screen.getByText(address);
      expect(optionElement).toBeInTheDocument();
      await user.click(optionElement);
      const values = address.split(separator);
      allFields.map(({ name }, index) => {
        expect(setFieldValue).toHaveBeenCalledWith(`address.${name}`, values?.[index]);
      });
    });
  });
});
