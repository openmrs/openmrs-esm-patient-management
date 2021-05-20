import React from 'react';
import Select from 'carbon-components-react/es/components/Select';
import SelectItem from 'carbon-components-react/es/components/SelectItem';
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
    <div>
      <Select id="identifier" {...field} labelText={label} light>
        {selectOptions}
      </Select>
    </div>
  );
};
