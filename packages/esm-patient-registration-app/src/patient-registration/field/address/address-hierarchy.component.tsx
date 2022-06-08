import React, { useEffect, useState, useContext } from 'react';
import { ComboBox } from 'carbon-components-react';
import { openmrsFetch } from '@openmrs/esm-framework';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { useField } from 'formik';

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

export const AddressHierarchy: React.FC = () => {
  const nulldata = [];
  const [comboboxlist, setcomboboxlist] = useState(nulldata);
  const [selected, setselected] = useState();
  const [addressconfig, setaddressconfig] = useState(nulldata);
  const { t } = useTranslation();
  // const [field] = useField('gender');
  const { setFieldValue } = useContext(PatientRegistrationContext);

  const setComboBoxFieldValue = (filedname: string, filedvalue: string) => {
    setFieldValue(filedname, filedvalue);
  };

  useEffect(() => {
    getConfig('layout.address.format&v=custom:(value)')
      .then((value) => {
        const xmlstring = value.data.results[0].value;
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlstring, 'text/xml');
        const filteredarray = xml.getElementsByTagName('nameMappings')[0].textContent.split('     ');
        setaddressconfig(filteredarray.filter((text) => !text.includes('.') && text.trim().length));
      })
      .catch((err) => {
        console.log(err);
      });
  });
  const comboboxevent = (text, id) => {
    if (text == '') {
    } else {
      //set to empty first
      setcomboboxlist([]);
      //parse and and add to list
      performAdressHirarchiWithParentSearch(id.replace(' ', ''), selected, text)
        .then((value) => {
          var element = [];
          value.data.forEach((parent1) => {
            element.push({ id: parent1['uuid'], text: parent1['name'] });
          });
          setcomboboxlist(element);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('addressHeader', 'Address')}</h4>
      <div
        style={{
          width: '50%',
          paddingBottom: '5%',
        }}>
        {addressconfig.map((id, index) => (
          <ComboBox
            downshiftProps={{
              onStateChange: function noRefCheck() {},
            }}
            id={id + '-combobox'}
            onInputChange={(event) => comboboxevent(event, id)}
            itemToString={(item) => (item ? item.text : '')}
            items={comboboxlist}
            onChange={(e) => {
              e.selectedItem != null ? setselected(e.selectedItem.id) : setselected(null);
              setComboBoxFieldValue(id, e.selectedItem.name);
              setcomboboxlist([]);
            }}
            // selectedItem={field.value}
            name={id}
            placeholder={id}
            titleText={id}
            key={id}
            light
          />
        ))}
      </div>
    </div>
  );
};
