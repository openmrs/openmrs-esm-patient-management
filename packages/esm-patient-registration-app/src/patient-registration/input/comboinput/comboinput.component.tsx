import { ComboBox, ComboBoxProps } from 'carbon-components-react';
import { useField } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { performAdressHierarchyWithParentSearch } from '../../../resource';

interface InputProps extends ComboBoxProps {
  name: string;
  labeltext: string;
  setSelectedValue: any;
  selected: string;
}

export const ComboInput: React.FC<InputProps> = ({ name, labeltext, setSelectedValue, selected }) => {
  const { t } = useTranslation();
  const [field, Meta, helpers] = useField(name);
  const [comboboxlist, setcomboboxlist] = useState([]);
  const [error, setError] = useState<Error>(null);
  const { setValue } = helpers;
  const comboboxevent = (text, id) => {
    if (text == '') {
    } else {
      performAdressHierarchyWithParentSearch(id.replace(' ', ''), selected, text)
        .then((value) => {
          setcomboboxlist(value.data.map((parent1) => ({ id: parent1['uuid'], text: parent1['name'] })));
        })
        .catch((err) => {
          setError(err);
        });
    }
  };

  if (error) {
    return <span>{t(`${error.message}`)}</span>;
  }

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
