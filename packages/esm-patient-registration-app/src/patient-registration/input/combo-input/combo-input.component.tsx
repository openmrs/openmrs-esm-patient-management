import { ComboBox, ComboBoxProps, Layer } from '@carbon/react';
import { useField } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { performAdressHierarchyWithParentSearch } from '../../../resource';

interface ComboInputProps extends Omit<ComboBoxProps, 'items'> {
  name: string;
  labelText: string;
  placeholder?: string;
  setSelectedValue: any;
  selected: string;
}

export const ComboInput: React.FC<ComboInputProps> = ({ name, labelText, placeholder, setSelectedValue, selected }) => {
  const { t } = useTranslation();
  const [field, _, helpers] = useField(name);
  const [listItems, setListItems] = useState([]);
  const [error, setError] = useState<Error>();
  const { setValue } = helpers;
  const comboBoxEvent = (text, id) => {
    if (text == '') {
    } else {
      performAdressHierarchyWithParentSearch(id.replace(' ', ''), selected, text)
        .then((value) => {
          setListItems(value.data.map((parent1) => ({ id: parent1['uuid'], text: parent1['name'] })));
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
    <div style={{ marginBottom: '1rem' }}>
      <Layer>
        <ComboBox
          id={name}
          onInputChange={(event) => {
            comboBoxEvent(event, name);
            setValue(event);
          }}
          items={listItems}
          itemToString={(item) => item?.text ?? ''}
          {...field}
          onChange={(e) => {
            if (Boolean(e.selectedItem)) {
              setSelectedValue(e.selectedItem.id);
              setValue(e.selectedItem.text);
            } else {
              setSelectedValue(undefined);
              setValue(undefined);
            }
          }}
          placeholder={placeholder}
          titleText={labelText}
        />
      </Layer>
    </div>
  );
};
