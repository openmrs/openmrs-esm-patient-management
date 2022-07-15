import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import dayjs from 'dayjs';
import { Input } from '../../basic-input/input/input.component';
import styles from './../../input.scss';

interface EstimatedAgeInputProps {
  yearsName: string;
  monthsName: string;
  setBirthdate(field: string, value: any, shouldValidate?: boolean): void;
}

export const EstimatedAgeInput: React.FC<EstimatedAgeInputProps> = ({ yearsName, monthsName, setBirthdate }) => {
  const [yearsField] = useField(yearsName);
  const [monthsField] = useField(monthsName);
  const { t } = useTranslation();

  useEffect(() => {
    setBirthdate(
      'birthdate',
      dayjs().subtract(yearsField.value, 'year').subtract(monthsField.value, 'month').toISOString().split('T')[0],
    );
  }, [yearsField.value, monthsField.value, setBirthdate]);

  return (
    <main className={styles.fieldRow}>
      <Input id="number" labelText={t('years', 'Years')} name={yearsName} />
      <Input id="number" labelText={t('months', 'Months')} name={monthsName} />
    </main>
  );
};
