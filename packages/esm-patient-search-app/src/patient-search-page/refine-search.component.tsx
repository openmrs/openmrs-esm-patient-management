import React, { useCallback, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ContentSwitcher, Layer, NumberInput, Switch, TextInput } from '@carbon/react';
import { ChevronUp, ChevronDown } from '@carbon/react/icons';
import reducer, { initialState } from './advanced-search-reducer';
import { AdvancedPatientSearchActionTypes, type AdvancedPatientSearchState } from '../types';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './refine-search.scss';

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
      const date = parseInt(evt.target.value) || 0;
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_DATE_OF_BIRTH,
        dateOfBirth: date,
      });
    },
    [formDispatch],
  );

  const handleMonthOfBirthChange = useCallback(
    (evt: { target: { value: string } }) => {
      const month = parseInt(evt.target.value) || 0;
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_MONTH_OF_BIRTH,
        monthOfBirth: month,
      });
    },
    [formDispatch],
  );

  const handleYearOfBirthChange = useCallback(
    (evt: { target: { value: string } }) => {
      const year = parseInt(evt.target.value) || 0;
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_YEAR_OF_BIRTH,
        yearOfBirth: year,
      });
    },
    [formDispatch],
  );

  const handlePhoneNumberChange = useCallback(
    (evt: { target: { value: string } }) => {
      const phoneNumber = parseInt(evt.target.value) || 0;
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_PHONE_NUMBER,
        phoneNumber,
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

  const handleAgeChange = useCallback(
    (evt: { target: { value: string } }) => {
      const age = parseInt(evt.target.value) || 0;
      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_AGE,
        age: age,
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
                      size={isTablet ? 'lg' : 'md'}
                      onChange={handleGenderChange}
                      selectedIndex={['any', 'male', 'female'].indexOf(formState.gender)}>
                      <Switch name="any" text={t('any', 'Any')} />
                      <Switch name="male" text={t('male', 'Male')} />
                      <Switch name="female" text={t('female', 'Female')} />
                    </ContentSwitcher>
                    <ContentSwitcher
                      id="gender"
                      size={isTablet ? 'lg' : 'md'}
                      onChange={handleGenderChange}
                      selectedIndex={['other', 'unknown'].indexOf(formState.gender)}>
                      <Switch name="other" text={t('other', 'Other')} />
                      <Switch name="unknown" text={t('unknown', 'Unknown')} />
                    </ContentSwitcher>
                  </div>
                  <div className={`${styles.fieldTabletOrOverlay} ${styles.dobFields}`}>
                    <NumberInput
                      id="dateOfBirth"
                      placeholder="DD"
                      value={formState.dateOfBirth || ''}
                      onChange={handleDateOfBirthChange}
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
                      onChange={handleMonthOfBirthChange}
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
                      onChange={handleYearOfBirthChange}
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
                </div>
                <div className={`${styles.padded} ${isTablet && styles.phoneLastVisitRow}`}>
                  <div className={styles.phonePostcode}>
                    <div className={styles.fieldTabletOrOverlay}>
                      <NumberInput
                        id="phoneNumber"
                        label={t('phoneNumber', 'Phone number')}
                        onChange={handlePhoneNumberChange}
                        type="number"
                        value={formState.phoneNumber || ''}
                        size={isTablet ? 'lg' : 'md'}
                        allowEmpty
                        hideSteppers
                        min={1}
                      />
                    </div>
                    <div className={styles.fieldTabletOrOverlay}>
                      <TextInput
                        id="postcode"
                        labelText={t('postcode', 'Postcode')}
                        onChange={handlePostCodeChange}
                        value={formState.postcode}
                        size={isTablet ? 'lg' : 'md'}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldTabletOrOverlay}>
                    <NumberInput
                      id="age"
                      value={formState.age || ''}
                      onChange={handleAgeChange}
                      size={isTablet ? 'lg' : 'md'}
                      label={t('age', 'Age')}
                      min={0}
                      allowEmpty
                      hideSteppers
                    />
                  </div>
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
          selectedIndex={['any', 'male', 'female'].indexOf(formState.gender)}>
          <Switch name="any" text={t('any', 'Any')} />
          <Switch name="male" text={t('male', 'Male')} />
          <Switch name="female" text={t('female', 'Female')} />
        </ContentSwitcher>
        <ContentSwitcher
          id="gender"
          onChange={handleGenderChange}
          selectedIndex={['other', 'unknown'].indexOf(formState.gender)}>
          <Switch name="other" text={t('other', 'Other')} />
          <Switch name="unknown" text={t('unknown', 'Unknown')} />
        </ContentSwitcher>
      </div>
      <div className={`${styles.field} ${styles.dobFields}`}>
        <Layer>
          <NumberInput
            id="dateOfBirth"
            placeholder="DD"
            value={formState.dateOfBirth || ''}
            onChange={handleDateOfBirthChange}
            className={styles.dobField}
            type="number"
            label={t('dayOfBirth', 'Day of Birth')}
            min={1}
            max={31}
            allowEmpty
            hideSteppers
          />
        </Layer>

        <Layer>
          <NumberInput
            id="monthOfBirth"
            placeholder="MM"
            value={formState.monthOfBirth || ''}
            onChange={handleMonthOfBirthChange}
            className={styles.dobField}
            type="number"
            label={t('monthOfBirth', 'Month of Birth')}
            min={1}
            max={12}
            allowEmpty
            hideSteppers
          />
        </Layer>

        <Layer>
          <NumberInput
            id="yearOfBirth"
            placeholder="YYYY"
            value={formState.yearOfBirth || ''}
            onChange={handleYearOfBirthChange}
            className={styles.dobField}
            type="number"
            label={t('yearOfBirth', 'Year of Birth')}
            allowEmpty
            hideSteppers
            min={1800}
            max={new Date().getFullYear()}
          />
        </Layer>
      </div>
      <div className={styles.field}>
        <Layer>
          <NumberInput
            id="age"
            value={formState.age || ''}
            onChange={handleAgeChange}
            size={isTablet ? 'lg' : 'md'}
            label={t('age', 'Age')}
            min={0}
            allowEmpty
            hideSteppers
          />
        </Layer>
      </div>
      <div className={styles.field}>
        <Layer>
          <NumberInput
            id="phoneNumber"
            label={t('phoneNumber', 'Phone number')}
            onChange={handlePhoneNumberChange}
            type="number"
            value={formState.phoneNumber || ''}
            allowEmpty
            hideSteppers
            min={1}
          />
        </Layer>
      </div>
      <div className={styles.field}>
        <Layer>
          <TextInput
            id="postcode"
            labelText={t('postcode', 'Postcode')}
            onChange={handlePostCodeChange}
            value={formState.postcode}
          />
        </Layer>
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
