import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourcesContext } from '../../../offline.resources';
import { ComboInput } from '../../input/combo-input/combo-input.component';
import { SkeletonText } from '@carbon/react';
import styles from '../field.scss';
import { Input } from '../../input/basic-input/input/input.component';
import { isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import AddressSearchComponent from './address-search.component';

export function getFieldValue(field: string, doc: XMLDocument) {
  const fieldElement = doc.getElementsByName(field)[0];
  return fieldElement ? fieldElement.getAttribute('value') : null;
}
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
      address: { useAddressHierarchy },
    },
  } = config;

  const layout = useLayoutType();

  useEffect(() => {
    const templateXmlDoc = parseString(addressTemplateXml);
    const elementDefaults = getTagAsDocument('elementdefaults', templateXmlDoc);
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
      */
      const value = getFieldValue(name, elementDefaults);
      return {
        id: name,
        name,
        value,
      };
    });
    setAddressLayout(propertiesObj);
  }, [t, addressTemplateXml]);

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
          width: isDesktop(layout) ? '50%' : '100%',
          paddingBottom: '5%',
        }}>
        {useAddressHierarchy ? (
          <>
            <AddressSearchComponent addressLayout={addressLayout} />
            {addressLayout.map((attributes, index) => (
              <Input
                key={`combo_input_${index}`}
                name={`address.${attributes.name}`}
                labelText={t(attributes.name)}
                id={attributes.name}
                setSelectedValue={setSelectedValue}
                selected={selected}
              />
            ))}
          </>
        ) : (
          addressLayout.map((attributes, index) => (
            <ComboInput
              key={`combo_input_${index}`}
              name={`address.${attributes.name}`}
              labelText={t(attributes.name)}
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
