import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, NumberInput, Switch, TextInput } from '@carbon/react';
import styles from './search-field.scss';
import { PersonAttributeField } from './person-attribute-field.component';
import { type SearchFieldConfig } from '../../types';

interface SearchFieldProps {
  field: SearchFieldConfig;
  formState: any;
  inTabletOrOverlay: boolean;
  isTablet: boolean;
  onInputChange: (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => void;
  onDateOfBirthChange: (dateComponent: 'date' | 'month' | 'year') => (evt: { target: { value: string } }) => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  field,
  formState,
  inTabletOrOverlay,
  isTablet,
  onInputChange,
  onDateOfBirthChange,
}) => {
  const { t } = useTranslation();

  switch (field.type) {
    case 'gender':
      return (
        <div className={classNames({ [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <div className={styles.labelText}>
            <label className={classNames(styles.sexLabelText, styles.label01)} htmlFor="#gender">
              {t(field.name, field.label)}
            </label>
          </div>
          <ContentSwitcher
            id="gender"
            size={isTablet ? 'lg' : 'md'}
            onChange={onInputChange('gender')}
            selectedIndex={['any', 'male', 'female'].indexOf(formState.gender)}>
            <Switch name="any" text={t('any', 'Any')} />
            <Switch name="male" text={t('male', 'Male')} />
            <Switch name="female" text={t('female', 'Female')} />
          </ContentSwitcher>
          <ContentSwitcher
            id="gender"
            size={isTablet ? 'lg' : 'md'}
            onChange={onInputChange('gender')}
            selectedIndex={['other', 'unknown'].indexOf(formState.gender)}>
            <Switch name="other" text={t('other', 'Other')} />
            <Switch name="unknown" text={t('unknown', 'Unknown')} />
          </ContentSwitcher>
        </div>
      );

    case 'dateOfBirth':
      return (
        <div className={classNames(styles.dobFields, { [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <NumberInput
            id="dateOfBirth"
            placeholder="DD"
            value={formState.dateOfBirth || ''}
            onChange={onDateOfBirthChange('date')}
            className={styles.dobField}
            type="number"
            label={t('dayOfBirth', 'Day of Birth')}
            min={1}
            max={31}
            allowEmpty
            hideSteppers
            size={isTablet ? 'lg' : 'md'}
          />
          <NumberInput
            id="monthOfBirth"
            placeholder="MM"
            value={formState.monthOfBirth || ''}
            onChange={onDateOfBirthChange('month')}
            className={styles.dobField}
            type="number"
            label={t('monthOfBirth', 'Month of Birth')}
            min={1}
            max={12}
            allowEmpty
            hideSteppers
            size={isTablet ? 'lg' : 'md'}
          />
          <NumberInput
            id="yearOfBirth"
            placeholder="YYYY"
            value={formState.yearOfBirth || ''}
            onChange={onDateOfBirthChange('year')}
            className={styles.dobField}
            type="number"
            label={t('yearOfBirth', 'Year of Birth')}
            allowEmpty
            hideSteppers
            min={1800}
            max={new Date().getFullYear()}
            size={isTablet ? 'lg' : 'md'}
          />
        </div>
      );

    case 'age':
      return (
        <div className={classNames({ [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <NumberInput
            id={field.name}
            value={formState[field.name] || ''}
            onChange={onInputChange(field.name)}
            type="number"
            label={field.label ? t(field.label) : t('age', 'Age')}
            min={field.min}
            max={field.max}
            allowEmpty
            hideSteppers
            size={isTablet ? 'lg' : 'md'}
            placeholder={field.placeholder}
          />
        </div>
      );

    case 'postcode':
      return (
        <div className={classNames({ [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <TextInput
            id={field.name}
            labelText={field.label ? t(field.label) : t('postcode', 'Postcode')}
            onChange={onInputChange(field.name)}
            value={formState[field.name]}
            size={isTablet ? 'lg' : 'md'}
            placeholder={field.placeholder}
          />
        </div>
      );

    case 'personAttribute':
      return (
        <div className={classNames({ [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <PersonAttributeField
            field={field}
            formState={formState}
            inTabletOrOverlay={inTabletOrOverlay}
            isTablet={isTablet}
            onInputChange={onInputChange}
          />
        </div>
      );
  }
};
