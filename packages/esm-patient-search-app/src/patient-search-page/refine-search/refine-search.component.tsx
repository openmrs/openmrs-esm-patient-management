import React, { useCallback, useReducer, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Layer } from '@carbon/react';
import reducer, { initialState } from '../advanced-search-reducer';
import {
  AdvancedPatientSearchActionTypes,
  type AdvancedPatientSearchState,
  type SearchFieldConfig,
  type SearchFieldType,
} from '../../types';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type PatientSearchConfig, type PersonAttributeFieldConfig } from '../../config-schema';
import { RefineSearchTablet } from './refine-search-tablet.component';
import styles from './refine-search.scss';
import { SearchField } from './search-field.component';

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
  const config = useConfig<PatientSearchConfig>();

  const handleInputChange = useCallback(
    (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => {
      const value = 'target' in evt ? evt.target.value : evt.name;

      formDispatch({
        type: AdvancedPatientSearchActionTypes.SET_FIELD,
        field: fieldName,
        value: value,
      });
    },
    [formDispatch],
  );

  const handleDateOfBirthChange = useCallback(
    (dateComponent: 'date' | 'month' | 'year') => (evt: { target: { value: string } }) => {
      const value = parseInt(evt.target.value) || 0;
      const actionType = {
        date: AdvancedPatientSearchActionTypes.SET_DATE_OF_BIRTH,
        month: AdvancedPatientSearchActionTypes.SET_MONTH_OF_BIRTH,
        year: AdvancedPatientSearchActionTypes.SET_YEAR_OF_BIRTH,
      }[dateComponent];

      formDispatch({
        type: actionType,
        [dateComponent === 'date' ? 'dateOfBirth' : dateComponent === 'month' ? 'monthOfBirth' : 'yearOfBirth']: value,
      });
    },
    [formDispatch],
  );

  const handleSubmit = useCallback(
    (evt: React.FormEvent) => {
      evt.preventDefault();
      setFilters(formState);
      setShowRefineSearchDialog(false);
    },
    [formState, setFilters],
  );

  const handleResetFields = useCallback(() => {
    formDispatch({
      type: AdvancedPatientSearchActionTypes.RESET_FIELDS,
    });
    setFilters(initialState);
    setShowRefineSearchDialog(false);
  }, [formDispatch, setFilters]);

  const toggleShowRefineSearchDialog = useCallback(() => {
    setShowRefineSearchDialog((prevState) => !prevState);
  }, []);

  const renderSearchFields = useCallback(() => {
    const fields: Array<SearchFieldConfig> = [];

    Object.entries(config.search.searchFields.fields).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.enabled) {
        fields.push({
          name: fieldName,
          type: fieldName as SearchFieldType,
          label: fieldConfig.label ?? fieldName,
        });
      }
    });

    config.search.searchFields.personAttributes?.forEach((attribute: PersonAttributeFieldConfig) => {
      fields.push({
        name: attribute.attributeTypeUuid,
        type: 'personAttribute',
        label: attribute.label,
        ...attribute,
      });
    });

    return fields.map((field) => (
      <Layer key={field.name}>
        <div className={styles.field}>
          <SearchField
            field={field}
            formState={formState}
            inTabletOrOverlay={inTabletOrOverlay}
            isTablet={isTablet}
            onInputChange={handleInputChange}
            onDateOfBirthChange={handleDateOfBirthChange}
          />
        </div>
      </Layer>
    ));
  }, [config, formState, inTabletOrOverlay, isTablet, handleInputChange, handleDateOfBirthChange]);

  if (inTabletOrOverlay) {
    return (
      <RefineSearchTablet
        showRefineSearchDialog={showRefineSearchDialog}
        filtersApplied={filtersApplied}
        formState={formState}
        config={config}
        isTablet={isTablet}
        onResetFields={handleResetFields}
        onToggleDialog={toggleShowRefineSearchDialog}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onDateOfBirthChange={handleDateOfBirthChange}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.refineSearchContainer} data-openmrs-role="Refine Search">
      <h2 className={styles.productiveHeading02}>{t('refineSearch', 'Refine search')}</h2>
      {renderSearchFields()}
      <hr className={classNames(styles.field, styles.horizontalDivider)} />
      <Button type="submit" kind="primary" size="md" className={classNames(styles.field, styles.button)}>
        {t('apply', 'Apply')}{' '}
        {filtersApplied ? `(${filtersApplied} ${t('countOfFiltersApplied', 'filters applied')})` : null}
      </Button>
      <Button
        kind="secondary"
        size="md"
        onClick={handleResetFields}
        className={classNames(styles.field, styles.button)}>
        {t('resetFields', 'Reset fields')}
      </Button>
    </form>
  );
};

export default RefineSearch;
