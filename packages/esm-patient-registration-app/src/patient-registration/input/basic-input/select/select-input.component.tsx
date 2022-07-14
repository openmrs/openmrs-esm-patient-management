import React from 'react';
import { Select, SelectItem } from '@carbon/react';
import { useField } from 'formik';

interface SelectInputProps {
  name: string;
  options: Array<string>;
  label: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({ name, options, label }) => {
  const [field, meta] = useField(name);
  const selectOptions = [
    <SelectItem disabled hidden text={`Select ${label}`} key="" value="" />,
    ...options.map((currentOption, index) => <SelectItem text={currentOption} value={currentOption} key={index} />),
  ];

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Select id="identifier" {...field} labelText={label} light>
        {selectOptions}
      </Select>
    </div>
  );
};
