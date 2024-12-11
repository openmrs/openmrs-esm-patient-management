import React, { useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Layer } from '@carbon/react';
import { useForm } from 'react-hook-form';
import { type AdvancedPatientSearchState, type SearchFieldConfig, type SearchFieldType } from '../../types';
import { useConfig, useLayoutType } from '@openmrs/esm-framework';
import {
  type BuiltInFieldConfig,
  type PatientSearchConfig,
  type PersonAttributeFieldConfig,
} from '../../config-schema';
import { RefineSearchTablet } from './refine-search-tablet.component';
import styles from './refine-search.scss';
import { SearchField } from './search-field.component';

export const initialFilters: AdvancedPatientSearchState = {
  gender: 'any',
  dateOfBirth: 0,
  monthOfBirth: 0,
  yearOfBirth: 0,
  postcode: '',
  age: 0,
  attributes: {},
};

interface RefineSearchProps {
  inTabletOrOverlay: boolean;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedPatientSearchState>>;
  filtersApplied: number;
}

const RefineSearch: React.FC<RefineSearchProps> = ({ setFilters, inTabletOrOverlay, filtersApplied }) => {
  const [showRefineSearchDialog, setShowRefineSearchDialog] = useState(false);
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const config = useConfig<PatientSearchConfig>();

  const { control, handleSubmit, reset, formState } = useForm<AdvancedPatientSearchState>({
    defaultValues: {
      gender: 'any',
      dateOfBirth: 0,
      monthOfBirth: 0,
      yearOfBirth: 0,
      age: 0,
      postcode: '',
      attributes: {},
    },
  });

  const onSubmit = useCallback(
    (data: AdvancedPatientSearchState) => {
      const cleanedAttributes = Object.entries(data.attributes || {}).reduce(
        (acc, [key, value]) => {
          if (value) {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      const cleanedData = {
        ...data,
        attributes: cleanedAttributes,
      };

      setFilters(cleanedData);
      setShowRefineSearchDialog(false);
    },
    [setFilters],
  );
  const handleResetFields = useCallback(() => {
    reset({ ...initialFilters, attributes: {} });
    setFilters(initialFilters);
    setShowRefineSearchDialog(false);
  }, [reset, setFilters]);

  const toggleShowRefineSearchDialog = useCallback(() => {
    setShowRefineSearchDialog((prevState) => !prevState);
  }, []);

  const renderSearchFields = useMemo(() => {
    const fields: Array<SearchFieldConfig> = [];

    Object.entries(config.search.searchFilterFields).forEach(([fieldName, fieldConfig]) => {
      if (fieldName !== 'personAttributes' && (fieldConfig as BuiltInFieldConfig).enabled) {
        fields.push({
          name: fieldName,
          type: fieldName as SearchFieldType,
        });
      }
    });

    config.search.searchFilterFields.personAttributes?.forEach((attribute: PersonAttributeFieldConfig) => {
      fields.push({
        name: attribute.attributeTypeUuid,
        type: 'personAttribute',
        ...attribute,
      });
    });

    return fields.map((field) => (
      <Layer key={field.name}>
        <div className={styles.field}>
          <SearchField field={field} control={control} inTabletOrOverlay={inTabletOrOverlay} isTablet={isTablet} />
        </div>
      </Layer>
    ));
  }, [config, inTabletOrOverlay, isTablet, control]);

  if (inTabletOrOverlay) {
    return (
      <RefineSearchTablet
        showRefineSearchDialog={showRefineSearchDialog}
        filtersApplied={filtersApplied}
        control={control}
        config={config}
        isTablet={isTablet}
        onResetFields={handleResetFields}
        onToggleDialog={toggleShowRefineSearchDialog}
        onSubmit={handleSubmit(onSubmit)}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={styles.refineSearchContainer}
      data-openmrs-role="Refine Search"
      role="refine-search">
      <h2 className={styles.productiveHeading02}>{t('refineSearch', 'Refine search')}</h2>
      {renderSearchFields}
      <hr className={classNames(styles.field, styles.horizontalDivider)} />
      <Button type="submit" kind="primary" size="md" className={classNames(styles.field, styles.button)}>
        {t('apply', 'Apply')}{' '}
        {filtersApplied
          ? `(${t('countOfFiltersApplied', '{{count}} filters applied', { count: filtersApplied })})`
          : null}
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
