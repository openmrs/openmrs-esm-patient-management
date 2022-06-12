import { openmrsFetch } from '@openmrs/esm-framework';
import { ComboBox, ComboBoxProps } from 'carbon-components-react';
import { useField } from 'formik';
import React, { useState } from 'react';
const AH_BASE_WS_API_URL = '/module/addresshierarchy/ajax/getPossibleAddressHierarchyEntriesWithParents.form';

interface InputProps extends ComboBoxProps {
  name: string;
  labeltext: string;
}
export function performAdressHirarchiWithParentSearch(addressField, parentid, query) {
  return openmrsFetch(
    `${AH_BASE_WS_API_URL}?addressField=${addressField}&limit=20&searchString=${query}&parentUuid=${parentid}`,
    {
      method: 'GET',
    },
  );
}
export const ComboInput: React.FC<InputProps> = ({ name, labeltext }) => {
  const [field, fieldMeta] = useField(name);
  const nulldata = [];
  const [comboboxlist, setcomboboxlist] = useState(nulldata);
  const [selected, setselected] = useState();
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
      onInputChange={(event) => comboboxevent(event, name)}
      items={comboboxlist}
      itemToString={(item) => (item ? item.text : '')}
      onChange={(e) => {
        e.selectedItem != null ? setselected(e.selectedItem.id) : setselected(null);
        // field.onChange(e);
      }}
      // value={field.value}
      name={field.name}
      selectedItem={field.value}
      placeholder={labeltext}
      titleText={labeltext}
      light
    />
  );
};
