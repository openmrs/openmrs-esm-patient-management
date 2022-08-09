import React from 'react';
import { Select, SelectItem } from 'carbon-components-react';
import { useField } from 'formik';
import { useTranslation } from 'react-i18next';

interface SelectInputProps {
  name: string;
  options: Array<string>;
  label: string;
  required?: boolean;
}

export const SelectInput: React.FC<SelectInputProps> = ({ name, options, label, required }) => {
  const [field, meta] = useField(name);
  const { t } = useTranslation();
  const selectOptions = [
    <SelectItem disabled hidden text={`Select ${label}`} key="" value="" />,
    ...options.map((currentOption, index) => <SelectItem text={currentOption} value={currentOption} key={index} />),
  ];

  const labelText = required ? label : `${label} (${t('optional', 'optional')})`;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <Select id="identifier" {...field} labelText={labelText} light>
        {selectOptions}
      </Select>
    </div>
  );
};
