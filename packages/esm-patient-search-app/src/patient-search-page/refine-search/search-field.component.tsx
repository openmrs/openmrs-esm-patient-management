import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, NumberInput, Switch, TextInput } from '@carbon/react';
import { type Control, Controller } from 'react-hook-form';
import styles from './search-field.scss';
import { PersonAttributeField } from './person-attribute-field.component';
import { type AdvancedPatientSearchState, type SearchFieldConfig } from '../../types';

interface SearchFieldProps {
  field: SearchFieldConfig;
  control: Control<AdvancedPatientSearchState>;
  inTabletOrOverlay: boolean;
  isTablet: boolean;
}

export const SearchField: React.FC<SearchFieldProps> = ({ field, control, inTabletOrOverlay, isTablet }) => {
  const { t } = useTranslation();

  switch (field.type) {
    case 'gender':
      return (
        <div className={classNames({ [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <div className={styles.labelText}>
            <label className={classNames(styles.sexLabelText, styles.label01)} htmlFor="gender">
              {t('sex', 'Sex')}
            </label>
          </div>
          <Controller
            name="gender"
            control={control}
            render={({ field: { onChange, value } }) => (
              <>
                <ContentSwitcher
                  id="gender"
                  size={isTablet ? 'lg' : 'md'}
                  onChange={({ name }) => onChange(name)}
                  selectedIndex={['any', 'male', 'female'].indexOf(value)}>
                  <Switch name="any" text={t('any', 'Any')} />
                  <Switch name="male" text={t('male', 'Male')} />
                  <Switch name="female" text={t('female', 'Female')} />
                </ContentSwitcher>
                <ContentSwitcher
                  id="gender"
                  size={isTablet ? 'lg' : 'md'}
                  onChange={({ name }) => onChange(name)}
                  selectedIndex={['other', 'unknown'].indexOf(value)}>
                  <Switch name="other" text={t('other', 'Other')} />
                  <Switch name="unknown" text={t('unknown', 'Unknown')} />
                </ContentSwitcher>
              </>
            )}
          />
        </div>
      );

    case 'dateOfBirth':
      return (
        <div className={classNames(styles.dobFields, { [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field: { onChange, value } }) => (
              <NumberInput
                id="dateOfBirth"
                placeholder="DD"
                value={value || ''}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className={styles.dobField}
                type="number"
                label={t('dayOfBirth', 'Day of Birth')}
                min={1}
                max={31}
                allowEmpty
                hideSteppers
                size={isTablet ? 'lg' : 'md'}
              />
            )}
          />
          <Controller
            name="monthOfBirth"
            control={control}
            render={({ field: { onChange, value } }) => (
              <NumberInput
                id="monthOfBirth"
                placeholder="MM"
                value={value || ''}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className={styles.dobField}
                type="number"
                label={t('monthOfBirth', 'Month of Birth')}
                min={1}
                max={12}
                allowEmpty
                hideSteppers
                size={isTablet ? 'lg' : 'md'}
              />
            )}
          />
          <Controller
            name="yearOfBirth"
            control={control}
            render={({ field: { onChange, value } }) => (
              <NumberInput
                id="yearOfBirth"
                placeholder="YYYY"
                value={value || ''}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                className={styles.dobField}
                type="number"
                label={t('yearOfBirth', 'Year of Birth')}
                allowEmpty
                hideSteppers
                min={1800}
                max={new Date().getFullYear()}
                size={isTablet ? 'lg' : 'md'}
              />
            )}
          />
        </div>
      );

    case 'age':
      return (
        <div className={classNames({ [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <Controller
            name="age"
            control={control}
            render={({ field: { onChange, value } }) => (
              <NumberInput
                id={field.name}
                value={value || ''}
                onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                type="number"
                label={t('age', 'Age')}
                min={field.min}
                max={field.max}
                allowEmpty
                hideSteppers
                size={isTablet ? 'lg' : 'md'}
                placeholder={field.placeholder}
              />
            )}
          />
        </div>
      );

    case 'postcode':
      return (
        <div className={classNames({ [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <Controller
            name="postcode"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                id={field.name}
                labelText={t('postcode', 'Postcode')}
                onChange={(e) => onChange(e.target.value)}
                value={value}
                size={isTablet ? 'lg' : 'md'}
                placeholder={field.placeholder}
              />
            )}
          />
        </div>
      );

    case 'personAttribute':
      return (
        <div className={classNames({ [styles.fieldTabletOrOverlay]: inTabletOrOverlay })}>
          <PersonAttributeField
            field={field}
            control={control}
            inTabletOrOverlay={inTabletOrOverlay}
            isTablet={isTablet}
          />
        </div>
      );
  }
};
