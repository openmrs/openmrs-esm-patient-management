import React, { useCallback, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch, TextInput, DatePicker, DatePickerInput, Button } from '@carbon/react';
import styles from './refine-search.scss';
import reducer, { initialState } from './advanced-search-reducer';
import { AdvancedPatientSearchActionTypes, AdvancedPatientSearchState } from '../types';

interface RefineSearchProps {
  setFilters: React.Dispatch<React.SetStateAction<AdvancedPatientSearchState>>;
}

const RefineSearch: React.FC<RefineSearchProps> = ({ setFilters }) => {
  const [formState, formDispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation();

  const handleGenderChange = useCallback(
    (evt: { name: 'any' | 'male' | 'female' }) => {
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_GENDER,
        gender: evt.name,
      });
    },
    [formDispatch],
  );

  const handleDateOfBirthChange = useCallback(
    (evt: { target: { value: string } }) => {
      const date = parseInt(evt.target.value);
      console.log(date, typeof date);
      if (!date) {
        formDispatch({
          type: AdvancedPatientSearchActionTypes.SET_DATE_OF_BIRTH,
          dateOfBirth: undefined,
        });
      } else if (date <= 31) {
        formDispatch({
          type: AdvancedPatientSearchActionTypes.SET_DATE_OF_BIRTH,
          dateOfBirth: date ?? undefined,
        });
      }
    },
    [formDispatch],
  );

  const handleMonthOfBirthChange = useCallback(
    (evt: { target: { value: string } }) => {
      const month = parseInt(evt.target.value);
      if (!month) {
        formDispatch({
          type: AdvancedPatientSearchActionTypes.SET_MONTH_OF_BIRTH,
          monthOfBirth: undefined,
        });
      } else if (month <= 12) {
        formDispatch({
          type: AdvancedPatientSearchActionTypes.SET_MONTH_OF_BIRTH,
          monthOfBirth: month,
        });
      }
    },
    [formDispatch],
  );

  const handleYearOfBirthChange = useCallback(
    (evt: { target: { value: string } }) => {
      const year = parseInt(evt.target.value);
      const currentYear = new Date().getFullYear();
      if (!year) {
        formDispatch({
          type: AdvancedPatientSearchActionTypes.SET_YEAR_OF_BIRTH,
          monthOfBirth: undefined,
        });
      } else if (year <= currentYear) {
        formDispatch({
          type: AdvancedPatientSearchActionTypes.SET_YEAR_OF_BIRTH,
          yearOfBirth: year,
        });
      }
    },
    [formDispatch],
  );

  const handlePhoneNumberChange = useCallback(
    (evt: { target: { value: number } }) => {
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_PHONE_NUMBER,
        phoneNumber: evt.target.value,
      });
    },
    [formDispatch],
  );

  const handlePostCodeChange = useCallback(
    (evt: { target: { value: number } }) => {
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_POSTCODE,
        postcode: evt.target.value,
      });
    },
    [formDispatch],
  );

  const handleDateOfVisitChange = useCallback(
    (evt) => {
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_DATE_OF_VISIT,
        dateOfVisit: evt.target.value,
      });
    },
    [formDispatch],
  );

  const handleSubmit = useCallback(
    (evt) => {
      evt.preventDefault();
      setFilters(formState);
    },
    [formDispatch, formState],
  );

  const handleResetFields = useCallback(
    (evt) => {
      formDispatch({
        type: AdvancedPatientSearchActionTypes.RESET_FIELDS,
      });
      setFilters(initialState);
    },
    [formDispatch, initialState],
  );

  return (
    <form onSubmit={handleSubmit} className={styles.refineSeachContainer}>
      <h2 className={styles.productiveHeading02}>{t('refineSearch', 'Refine search')}</h2>
      <div className={styles.field}>
        <label className={`${styles.sexLabelText} ${styles.label01}`} htmlFor="#gender">
          {t('sex', 'Sex')}
        </label>
        <ContentSwitcher
          id="gender"
          onChange={handleGenderChange}
          selectedIndex={formState.gender === 'any' ? 0 : formState.gender === 'male' ? 1 : 2}>
          <Switch name="any" text={t('any', 'Any')} />
          <Switch name="male" text={t('male', 'Male')} />
          <Switch name="female" text={t('female', 'Female')} />
        </ContentSwitcher>
      </div>
      <div className={`${styles.field} ${styles.dobFields}`}>
        <TextInput
          id="dateOfBirth"
          placeholder="DD"
          value={formState.dateOfBirth ?? ''}
          onChange={handleDateOfBirthChange}
          className={styles.dobField}
          type="number"
          labelText={t('day', 'Day')}
          light
        />
        <TextInput
          id="monthOfBirth"
          placeholder="MM"
          value={formState.monthOfBirth ?? ''}
          onChange={handleMonthOfBirthChange}
          className={styles.dobField}
          type="number"
          labelText={t('month', 'Month')}
          light
        />
        <TextInput
          id="yearOfBirth"
          placeholder="YYYY"
          value={formState.yearOfBirth ?? ''}
          onChange={handleYearOfBirthChange}
          className={styles.dobField}
          type="number"
          labelText={t('year', 'Year')}
          light
        />
      </div>
      <div className={styles.field}>
        <TextInput
          id="phoneNumber"
          labelText={t('phoneNumber', 'Phone number')}
          onChange={handlePhoneNumberChange}
          value={formState.phoneNumber ?? ''}
          type="number"
          light
        />
      </div>
      <div className={styles.field}>
        <TextInput
          id="postcode"
          labelText={t('postcode', 'Postcode')}
          onChange={handlePostCodeChange}
          value={formState.postcode ?? ''}
          type="number"
          light
        />
      </div>
      <div className={styles.field}>
        <DatePicker
          id="dateOfVisit"
          labelText={t('dateOfVisit', 'Date of last visit')}
          type="single"
          light
          onChange={handleDateOfVisitChange}
          value={formState.dateOfVisit ?? ''}>
          <DatePickerInput labelText={t('dateOfVisit', 'Date of last visit')} />
        </DatePicker>
      </div>
      <hr className={`${styles.field} ${styles.horizontalDivider}`} />
      <Button type="submit" kind="primary" size="md" className={`${styles.field} ${styles.button}`}>
        {t('apply', 'Apply')}
      </Button>
      <Button kind="secondary" size="md" onClick={handleResetFields} className={`${styles.field} ${styles.button}`}>
        {t('resetFields', 'ResetFields')}
      </Button>
    </form>
  );
};

export default RefineSearch;
