import { ComboBox, ComboBoxProps } from 'carbon-components-react';
import { useField } from 'formik';
import React, { useState } from 'react';
import { performAdressHierarchyWithParentSearch } from '../../../resource';

interface InputProps extends ComboBoxProps {
  name: string;
  labeltext: string;
  setSelectedValue: any;
  selected: string;
}

export const ComboInput: React.FC<InputProps> = ({ name, labeltext, setSelectedValue, selected }) => {
  const [field, Meta, helpers] = useField(name);
  const [comboboxlist, setcomboboxlist] = useState([]);
  const { setValue } = helpers;
  const comboboxevent = (text, id) => {
    if (text == '') {
    } else {
      performAdressHierarchyWithParentSearch(id.replace(' ', ''), selected, text)
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
