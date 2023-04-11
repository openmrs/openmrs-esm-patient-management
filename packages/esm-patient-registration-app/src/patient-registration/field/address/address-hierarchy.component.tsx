import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesContext } from '../../../offline.resources';
import { ComboInput } from '../../input/combo-input/combo-input.component';
import { SkeletonText } from '@carbon/react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { useConfig } from '@openmrs/esm-framework';
import AddressSearchComponent from './address-search.component';
import { PatientRegistrationContext } from '../../patient-registration-context';

function parseString(xmlDockAsString: string) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlDockAsString, 'text/xml');
}
function getTagAsDocument(tagName: string, template: XMLDocument) {
  const tmp = template.getElementsByTagName(tagName)[0];
  return tmp ? parseString(tmp.outerHTML) : parseString('');
}

export const AddressHierarchy: React.FC = () => {
  const [selected, setSelected] = useState('');
  const [addressLayout, setAddressLayout] = useState([]);
  const { t } = useTranslation();
  const { addressTemplate } = useContext(ResourcesContext);
  const addressTemplateXml = addressTemplate?.results[0].value;
  const setSelectedValue = (value: string) => {
    setSelected(value);
  };
  const config = useConfig();
  const {
    fieldConfigurations: {
      address: {
        useAddressHierarchy: { enabled, useQuickSearch, searchAddressByLevel },
      },
    },
  } = config;

  const { setFieldValue, values } = useContext(PatientRegistrationContext);

  useEffect(() => {
    const templateXmlDoc = parseString(addressTemplateXml);
    const elementDefaults = getTagAsDocument('elementDefaults', templateXmlDoc);
    const defaultValuesEntries = elementDefaults.getElementsByTagName('entry');
    const defaultValues = Object.fromEntries(
      Array.prototype.map.call(defaultValuesEntries, (entry: Element) => {
        const [name, value] = Array.from(entry.getElementsByTagName('string'));
        return [name.innerHTML, value.innerHTML];
      }),
    );
    const nameMappings = getTagAsDocument('nameMappings', templateXmlDoc);
    const properties =
      Array.from(nameMappings.getElementsByTagName('property')).length > 0
        ? nameMappings.getElementsByTagName('property')
        : nameMappings.getElementsByTagName('entry');

    const propertiesObj = Array.prototype.map.call(properties, (property: Element) => {
      const name = property.getAttribute('name') ?? property.getElementsByTagName('string')[0].innerHTML;
      const label = property.getAttribute('value') ?? property.getElementsByTagName('string')[1].innerHTML;
      /*
        DO NOT REMOVE THIS COMMENT UNLESS YOU UNDERSTAND WHY IT IS HERE

        t('postalCode', 'Postal code')
        t('address1', 'Address line 1')
        t('address2', 'Address line 2')
        t('countyDistrict', 'District')
        t('stateProvince', 'State')
        t('cityVillage', 'city')
        t('country', 'Country')
        t('countyDistrict', 'District')
      */
      const value = defaultValues[name];
      if (!values?.address?.[name] && value) {
        setFieldValue(`address.${name}`, value);
      }
      return {
        id: name,
        name,
        value,
        label,
      };
    });
    setAddressLayout(propertiesObj);
  }, [t, addressTemplateXml, setFieldValue, values]);

  if (!addressTemplate) {
    return (
      <div>
        <h4 className={styles.productiveHeading02Light}>{t('addressHeader', 'Address')}</h4>
        <SkeletonText />
      </div>
    );
  }

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('addressHeader', 'Address')}</h4>
      <div
        style={{
          paddingBottom: '5%',
        }}>
        {enabled ? (
          <>
            {useQuickSearch && <AddressSearchComponent addressLayout={addressLayout} />}
            {addressLayout.map((attributes, index) =>
              searchAddressByLevel ? (
                <ComboInput
                  key={`combo_input_${index}`}
                  textFieldName={attributes.name}
                  name={`address.${attributes.label}`}
                  labelText={t(attributes.label)}
                  id={attributes.name}
                  setSelectedValue={setSelectedValue}
                  selected={selected}
                />
              ) : (
                <Input
                  key={`combo_input_${index}`}
                  name={`address.${attributes.name}`}
                  labelText={t(attributes.label)}
                  id={attributes.name}
                  setSelectedValue={setSelectedValue}
                  selected={selected}
                />
              ),
            )}
          </>
        ) : (
          addressLayout.map((attributes, index) => (
            <Input
              key={`combo_input_${index}`}
              name={`address.${attributes.name}`}
              labelText={t(attributes.label)}
              id={attributes.name}
              setSelectedValue={setSelectedValue}
              selected={selected}
            />
          ))
        )}
      </div>
    </div>
  );
};
