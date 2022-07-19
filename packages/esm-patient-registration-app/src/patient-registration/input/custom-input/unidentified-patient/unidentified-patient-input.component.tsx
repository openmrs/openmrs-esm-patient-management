import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { Input } from '../../basic-input/input/input.component';

interface UnidentifiedPatientInputProps {
  name: string;
  setName(field: string, value: any, shouldValidate?: boolean): void;
}

export const UnidentifiedPatientInput: React.FC<UnidentifiedPatientInputProps> = ({ setName, name }) => {
  const [field] = useField({ name });
  const { t } = useTranslation();

  useEffect(() => {
    if (field.value) {
      setName('givenName', 'UNKNOWN');
      setName('middleName', 'UNKNOWN');
      setName('familyName', 'UNKNOWN');
    }
  }, [field.value, setName]);

  return <Input id="checkbox" labelText={t('unidentifiedPatient', 'Unidentified Patient')} name={name} />;
};
