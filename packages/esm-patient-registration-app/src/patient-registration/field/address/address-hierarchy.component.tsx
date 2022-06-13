import React, { useEffect, useState, useContext } from 'react';
import { ComboBox } from 'carbon-components-react';
import { openmrsFetch } from '@openmrs/esm-framework';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { ResourcesContext } from '../../../offline.resources';
import { ComboInput } from '../../input/combo/comboinput.component';

const AH_BASE_WS_API_URL = '/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form';
const CONF_BASE_WS_API_URL = '/ws/rest/v1/';

export function getConfig(query) {
  return openmrsFetch(`${CONF_BASE_WS_API_URL}systemsetting?q=${query}`, {
    method: 'GET',
  });
}
export function performAdressHirarchiWithParentSearch(addressField, parentid, query) {
  return openmrsFetch(
    `${AH_BASE_WS_API_URL}?addressField=${addressField}&limit=20&searchString=${query}&parentUuid=${parentid}`,
    {
      method: 'GET',
    },
  );
}
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
  const nulldata = [];
  const [comboboxlist, setcomboboxlist] = useState(nulldata);
  const [selected, setSelected] = useState('');
  const [addressconfig, setaddressconfig] = useState(nulldata);
  const { t } = useTranslation();
  const { addressTemplate } = useContext(ResourcesContext);
  const addressTemplateXml = addressTemplate.results[0].value;

  const setSelectedValue = (value: string) => {
    setSelected(value);
  };

  useEffect(() => {
    const templateXmlDoc = parseString(addressTemplateXml);
    const elementDefaults = getTagAsDocument('elementdefaults', templateXmlDoc);
    const nameMappings = getTagAsDocument('nameMappings', templateXmlDoc);
    const properties = nameMappings.getElementsByTagName('entry');
    const propertiesObj = Array.prototype.map.call(properties, (property: Element) => {
      const name = property.getElementsByTagName('string')[0].innerHTML;
      const labelText = t(name, property.getElementsByTagName('string')[1].innerHTML);
      const value = getFieldValue(name, elementDefaults);
      return {
        id: name,
        name,
        labelText,
        value,
      };
    });
    setaddressconfig(propertiesObj);
  }, [t, addressTemplateXml]);

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('addressHeader', 'Address')}</h4>
      <div
        style={{
          width: '50%',
          paddingBottom: '5%',
        }}>
        {addressconfig.map((attributes) => (
          <ComboInput
            name={attributes.name}
            labeltext={attributes.labelText}
            items={comboboxlist}
            id={attributes.name}
            placeholder={attributes.labelText}
            setSelectedValue={setSelectedValue}
            selected={selected}
          />
        ))}
      </div>
    </div>
  );
};
