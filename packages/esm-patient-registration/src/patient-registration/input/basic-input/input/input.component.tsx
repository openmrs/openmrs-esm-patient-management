import React from 'react';
import TextInput from 'carbon-components-react/es/components/TextInput';
import { useField } from 'formik';

interface InputProps {
  id: string;
  name: string;
  labelText: string;
  light: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const Input: React.FC<InputProps> = (props) => {
  const [field, meta] = useField(props.name);

  return (
    <div style={{ marginBottom: '1rem' }}>
      <TextInput
        {...props}
        {...field}
        invalid={!!(meta.touched && meta.error)}
        invalidText={meta.error}
        value={field.value || ''}
      />
    </div>
  );
};
