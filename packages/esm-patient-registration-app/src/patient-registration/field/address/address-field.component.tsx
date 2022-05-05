import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../input/basic-input/input/input.component';
import { ResourcesContext } from '../../../offline.resources';
import styles from '../field.scss';
import { SkeletonText } from 'carbon-components-react';

function parseString(xmlDockAsString: string) {
  const parser = new DOMParser();
  return parser.parseFromString(xmlDockAsString, 'text/xml');
}

function getTagAsDocument(tagName: string, template: XMLDocument) {
  const tmp = template.getElementsByTagName(tagName)[0];
  return tmp ? parseString(tmp.outerHTML) : parseString('');
}

function getFieldValue(field: string, doc: XMLDocument) {
  const fieldElement = doc.getElementsByTagName(field)[0];
  return fieldElement ? fieldElement.getAttribute('value') : null;
}

export const AddressField: React.FC = () => {
  const { addressTemplate } = useContext(ResourcesContext);
  const [addressFields, setAddressFields] = useState([]);
  const { t } = useTranslation();
  const addressTemplateXml = addressTemplate?.results[0].value;

  useEffect(() => {
    if (addressTemplateXml) {
      const templateXmlDoc = parseString(addressTemplateXml);
      const nameMappings = getTagAsDocument('nameMappings', templateXmlDoc);
      const elementDefaults = getTagAsDocument('elementdefaults', templateXmlDoc);
      const properties = nameMappings.getElementsByTagName('property');
      const propertiesObj = Array.prototype.map.call(properties, (property: Element) => {
        const name = property.getAttribute('name');
        /*
        t('postalCode')
        t('address1')
        t('stateProvince')
        t('cityVillage')
        t('country')
      */
        const labelText = t(name, property.getAttribute('value'));
        const value = getFieldValue(name, elementDefaults);
        return {
          id: name,
          name,
          labelText,
          value,
        };
      });
      setAddressFields(propertiesObj);
    }
  }, [t, addressTemplateXml]);

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('addressHeader', 'Address')}</h4>
      {addressTemplate ? (
        <div>
          {addressFields.map((attributes) => (
            <Input key={attributes.name} {...attributes} light />
          ))}
        </div>
      ) : (
        <SkeletonText />
      )}
    </div>
  );
};
