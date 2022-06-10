import { ComboBox, ComboBoxProps } from 'carbon-components-react';
import { useField } from 'formik';
import React from 'react';

interface InputProps extends ComboBoxProps {
  name: string;
  onSearch: any;
  onSelect: any;
  labeltext: string;
  items: any;
  itemToString: any;
}
export const ComboInput: React.FC<InputProps> = ({ name, onSearch, onSelect, labeltext, items, itemToString }) => {
  const [field, fieldMeta] = useField(name);
  return (
    <ComboBox
      id={name}
      onInputChange={onSearch}
      items={items}
      itemToString={itemToString}
      onChange={onSelect}
      name={name}
      {...field}
      placeholder={labeltext}
      titleText={labeltext}
      light
    />
  );
};
