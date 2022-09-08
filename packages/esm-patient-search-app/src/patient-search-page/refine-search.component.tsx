import React, { useCallback, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, Switch, TextInput, DatePicker, DatePickerInput, Button } from '@carbon/react';
import { ChevronUp, ChevronDown } from '@carbon/react/icons';
import styles from './refine-search.scss';
import reducer, { initialState } from './advanced-search-reducer';
import { AdvancedPatientSearchActionTypes, AdvancedPatientSearchState } from '../types';
import { useLayoutType } from '@openmrs/esm-framework';

interface RefineSearchProps {
  inTabletOrOverlay: boolean;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedPatientSearchState>>;
  filtersApplied: number;
}

const RefineSearch: React.FC<RefineSearchProps> = ({ setFilters, inTabletOrOverlay, filtersApplied }) => {
  const [formState, formDispatch] = useReducer(reducer, initialState);
  const [showRefineSearchDialog, setShowRefineSearchDialog] = useState(false);
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';

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
    (evt: { target: { value: string } }) => {
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
      setShowRefineSearchDialog(false);
    },
    [formState, setShowRefineSearchDialog, setFilters],
  );

  const handleResetFields = useCallback(() => {
    formDispatch({
      type: AdvancedPatientSearchActionTypes.RESET_FIELDS,
    });
    setFilters(initialState);
    setShowRefineSearchDialog(false);
  }, [formDispatch, setShowRefineSearchDialog, setFilters]);

  const toggleShowRefineSearchDialog = useCallback(() => {
    setShowRefineSearchDialog((prevState) => !prevState);
  }, []);

  if (inTabletOrOverlay) {
    return (
      <>
        <div className={styles.refineSearchBanner}>
          {!filtersApplied ? (
            <p className={styles.bodyShort01}>
              {t('refineSearchTabletBannerText', "Can't find who you're looking for?")}
            </p>
          ) : (
            <div className={styles.refineSearchBannerFilterInfo}>
              <span className={`${styles.filtersAppliedCount} ${styles.bodyShort01}`}>{filtersApplied}</span>{' '}
              <p className={styles.bodyShort01}>{t('filtersAppliedText', 'search queries added')}</p>
              <Button kind="ghost" onClick={handleResetFields} className={styles.refineSearchDialogOpener} size="sm">
                {t('clear', 'Clear')}
              </Button>
            </div>
          )}
          <Button
            kind="ghost"
            onClick={toggleShowRefineSearchDialog}
            renderIcon={!showRefineSearchDialog ? ChevronUp : ChevronDown}
            className={styles.refineSearchDialogOpener}
            size="sm">
            {t('refineSearch', 'Refine search')}
          </Button>
        </div>
        {showRefineSearchDialog && (
          <div className={styles.refineSearchDialogContainer}>
            <div className={styles.refineSearchDialog}>
              <div className={styles.refineSearchDialogHeader}>
                <p className={styles.bodyShort01}>{t('refineSearchHeaderText', 'Add additional search criteria')}</p>
                <Button
                  kind="ghost"
                  onClick={toggleShowRefineSearchDialog}
                  renderIcon={ChevronDown}
                  className={styles.refineSearchDialogOpener}
                  size="sm">
                  {t('refineSearch', 'Refine search')}
                </Button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className={`${styles.padded} ${isTablet && styles.refineSearchDialogGenderSexRow}`}>
                  <div className={styles.fieldTabletOrOverlay}>
                    <div className={styles.labelText}>
                      <label className={`${styles.sexLabelText} ${styles.label01}`} htmlFor="#gender">
                        {t('sex', 'Sex')}
                      </label>
                    </div>
                    <ContentSwitcher
                      id="gender"
                      onChange={handleGenderChange}
                      size={isTablet ? 'lg' : 'md'}
                      selectedIndex={formState.gender === 'any' ? 0 : formState.gender === 'male' ? 1 : 2}>
                      <Switch name="any" text={t('any', 'Any')} />
                      <Switch name="male" text={t('male', 'Male')} />
                      <Switch name="female" text={t('female', 'Female')} />
                    </ContentSwitcher>
                  </div>
                  <div className={`${styles.fieldTabletOrOverlay} ${styles.dobFields}`}>
                    <TextInput
                      id="dateOfBirth"
                      placeholder="DD"
                      value={formState.dateOfBirth ?? ''}
                      onChange={handleDateOfBirthChange}
                      className={styles.dobField}
                      type="number"
                      size={isTablet ? 'lg' : 'md'}
                      labelText={t('day', 'Day')}
                    />
                    <TextInput
                      id="monthOfBirth"
                      placeholder="MM"
                      value={formState.monthOfBirth ?? ''}
                      onChange={handleMonthOfBirthChange}
                      className={styles.dobField}
                      size={isTablet ? 'lg' : 'md'}
                      type="number"
                      labelText={t('month', 'Month')}
                    />
                    <TextInput
                      id="yearOfBirth"
                      placeholder="YYYY"
                      value={formState.yearOfBirth ?? ''}
                      onChange={handleYearOfBirthChange}
                      className={styles.dobField}
                      type="number"
                      size={isTablet ? 'lg' : 'md'}
                      labelText={t('year', 'Year')}
                    />
                  </div>
                </div>
                <div className={`${styles.padded} ${isTablet && styles.phoneLastVisitRow}`}>
                  <div className={styles.phonePostcode}>
                    <div className={styles.fieldTabletOrOverlay}>
                      <TextInput
                        id="phoneNumber"
                        labelText={t('phoneNumber', 'Phone number')}
                        onChange={handlePhoneNumberChange}
                        value={formState.phoneNumber ?? ''}
                        type="number"
                        size={isTablet ? 'lg' : 'md'}
                      />
                    </div>
                    <div className={styles.fieldTabletOrOverlay}>
                      <TextInput
                        id="postcode"
                        labelText={t('postcode', 'Postcode')}
                        onChange={handlePostCodeChange}
                        value={formState.postcode ?? ''}
                        size={isTablet ? 'lg' : 'md'}
                      />
                    </div>
                  </div>
                  <DatePicker
                    id="dateOfVisit"
                    labelText={t('dateOfVisit', 'Date of last visit')}
                    type="single"
                    onChange={handleDateOfVisitChange}
                    size={isTablet ? 'lg' : 'md'}
                    value={formState.dateOfVisit ?? ''}>
                    <DatePickerInput
                      placeholder="mm/dd/yyyy"
                      size={isTablet ? 'lg' : 'md'}
                      labelText={t('dateOfVisit', 'Date of last visit')}
                    />
                  </DatePicker>
                </div>
                <div className={`${isTablet && styles.paddedButtons} ${styles.buttonSet}`}>
                  <Button kind="secondary" size="xl" onClick={handleResetFields} className={styles.button}>
                    {t('resetFields', 'Reset fields')}
                  </Button>
                  <Button type="submit" kind="primary" size="xl" className={styles.button}>
                    {t('apply', 'Apply')}{' '}
                    {filtersApplied ? `(${filtersApplied} ${t('countOfFiltersApplied', 'filters applied')})` : null}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.refineSeachContainer}>
      <h2 className={styles.productiveHeading02}>{t('refineSearch', 'Refine search')}</h2>
      <div className={styles.field}>
        <div className={styles.labelText}>
          <label className={`${styles.sexLabelText} ${styles.label01}`} htmlFor="#gender">
            {t('sex', 'Sex')}
          </label>
        </div>
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
          <DatePickerInput placeholder="mm/dd/yyyy" labelText={t('dateOfVisit', 'Date of last visit')} />
        </DatePicker>
      </div>
      <hr className={`${styles.field} ${styles.horizontalDivider}`} />
      <Button type="submit" kind="primary" size="md" className={`${styles.field} ${styles.button}`}>
        {t('apply', 'Apply')}{' '}
        {filtersApplied ? `(${filtersApplied} ${t('countOfFiltersApplied', 'filters applied')})` : null}
      </Button>
      <Button kind="secondary" size="md" onClick={handleResetFields} className={`${styles.field} ${styles.button}`}>
        {t('resetFields', 'Reset fields')}
      </Button>
    </form>
  );
};

export default RefineSearch;
