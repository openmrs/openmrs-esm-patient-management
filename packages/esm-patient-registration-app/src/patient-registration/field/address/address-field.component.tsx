import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesContext } from '../../../offline.resources';
import { SkeletonText, InlineNotification } from '@carbon/react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useConfig } from '@openmrs/esm-framework';
import AddressSearchComponent from './address-search.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useOrderedAddressHierarchyLevels } from './address-hierarchy.resource';
import AddressHierarchyLevels from './address-hierarchy-levels.component';

function parseString(xmlDockAsString: string) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlDockAsString, 'text/xml');
}

export const AddressComponent: React.FC = () => {
  const [selected, setSelected] = useState('');
  const { addressTemplate } = useContext(ResourcesContext);
  const addressLayout = useMemo(() => {
    if (!addressTemplate?.lines) {
      return [];
    }
    const allFields = addressTemplate?.lines?.flat();
    const fields = allFields?.filter(({ isToken }) => isToken === 'IS_ADDR_TOKEN');

    return fields.map(({ displayText, codeName }) => ({
      id: codeName,
      name: codeName,
      label: displayText,
    }));
  }, [addressTemplate]);

  const { t } = useTranslation();
  const config = useConfig();
  const {
    fieldConfigurations: {
      address: {
        useAddressHierarchy: { enabled: addressHierarchyEnabled, useQuickSearch, searchAddressByLevel },
      },
    },
  } = config;

  const { setFieldValue } = useContext(PatientRegistrationContext);
  const { orderedFields, isLoadingFieldOrder, errorFetchingFieldOrder } = useOrderedAddressHierarchyLevels();

  useEffect(() => {
    if (addressTemplate?.elementDefaults) {
      Object.entries(addressTemplate.elementDefaults).forEach(([name, defaultValue]) => {
        setFieldValue(`address.${name}`, defaultValue);
      });
    }
  }, [addressTemplate, setFieldValue]);

  const orderedAddressFields = useMemo(() => {
    if (isLoadingFieldOrder || errorFetchingFieldOrder) {
      return [];
    }

    const orderMap = Object.fromEntries(orderedFields.map((field, indx) => [field, indx]));

    return [...addressLayout].sort(
      (existingField1, existingField2) => orderMap[existingField1.name] - orderMap[existingField2.name],
    );
  }, [isLoadingFieldOrder, errorFetchingFieldOrder, orderedFields, addressLayout]);

  if (!addressTemplate) {
    return (
      <AddressComponentContainer>
        <SkeletonText />
      </AddressComponentContainer>
    );
  }

  if (!addressHierarchyEnabled) {
    return (
      <AddressComponentContainer>
        {addressLayout.map((attributes, index) => (
          <Input
            key={`combo_input_${index}`}
            name={`address.${attributes.name}`}
            labelText={t(attributes.label)}
            id={attributes.name}
            selected={selected}
          />
        ))}
      </AddressComponentContainer>
    );
  }

  if (isLoadingFieldOrder) {
    return (
      <AddressComponentContainer>
        <SkeletonText />
      </AddressComponentContainer>
    );
  }

  if (errorFetchingFieldOrder) {
    return (
      <AddressComponentContainer>
        <InlineNotification
          style={{ margin: '0', minWidth: '100%' }}
          kind="error"
          lowContrast={true}
          title={t('errorFetchingOrderedFields', 'Error occured fetching ordered fields for address hierarchy')}
        />
      </AddressComponentContainer>
    );
  }

  return (
    <AddressComponentContainer>
      {useQuickSearch && <AddressSearchComponent addressLayout={orderedAddressFields} />}
      {searchAddressByLevel ? (
        <AddressHierarchyLevels orderedAddressFields={orderedAddressFields} />
      ) : (
        orderedAddressFields.map((attributes, index) => (
          <Input
            key={`combo_input_${index}`}
            name={`address.${attributes.name}`}
            labelText={t(attributes.label)}
            id={attributes.name}
            selected={selected}
          />
        ))
      )}
    </AddressComponentContainer>
  );
};

const AddressComponentContainer = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('addressHeader', 'Address')}</h4>
      <div
        style={{
          paddingBottom: '5%',
        }}>
        {children}
      </div>
    </div>
  );
};
