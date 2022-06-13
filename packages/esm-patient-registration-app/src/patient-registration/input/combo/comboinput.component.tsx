import { openmrsFetch } from '@openmrs/esm-framework';
import { ComboBox, ComboBoxProps } from 'carbon-components-react';
import { useField } from 'formik';
import React, { useContext, useState } from 'react';
import { PatientRegistrationContext } from '../../patient-registration-context';
const AH_BASE_WS_API_URL = '/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form';

interface InputProps extends ComboBoxProps {
  name: string;
  labeltext: string;
  setSelectedValue: any;
  selected: string;
}
export function performAdressHirarchiWithParentSearch(addressField, parentid, query) {
  return openmrsFetch(
    `${AH_BASE_WS_API_URL}?addressField=${addressField}&limit=20&searchString=${query}&parentUuid=${parentid}`,
    {
      method: 'GET',
    },
  );
}
export const ComboInput: React.FC<InputProps> = ({ name, labeltext, setSelectedValue, selected }) => {
  const [field, Meta, helpers] = useField(name);
  const nulldata = [];
  const [comboboxlist, setcomboboxlist] = useState(nulldata);
  const { setValue } = helpers;
  const comboboxevent = (text, id) => {
    if (text == '') {
    } else {
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
    <ComboBox
      id={name}
      onInputChange={(event) => {
        comboboxevent(event, name);
        setValue(event);
      }}
      items={comboboxlist}
      itemToString={(item) => (item ? item.text : '')}
      {...field}
      onChange={(e) => {
        e.selectedItem != null ? setSelectedValue(e.selectedItem.id) : setSelectedValue(null);
        setValue(e.selectedItem != null ? e.selectedItem.text : null);
      }}
      placeholder={labeltext}
      titleText={labeltext}
      light
    />
  );
};
