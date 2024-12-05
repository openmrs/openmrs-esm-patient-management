import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ChevronDownIcon, ChevronUpIcon } from '@openmrs/esm-framework';
import { type Control } from 'react-hook-form';
import { type AdvancedPatientSearchState, type SearchFieldConfig, type SearchFieldType } from '../../types';
import {
  type BuiltInFieldConfig,
  type PatientSearchConfig,
  type PersonAttributeFieldConfig,
} from '../../config-schema';
import { SearchField } from './search-field.component';
import styles from './refine-search-tablet.scss';

interface RefineSearchTabletProps {
  showRefineSearchDialog: boolean;
  filtersApplied: number;
  control: Control<AdvancedPatientSearchState>;
  config: PatientSearchConfig;
  isTablet: boolean;
  onResetFields: () => void;
  onToggleDialog: () => void;
  onSubmit: (evt: React.FormEvent) => void;
}

export const RefineSearchTablet: React.FC<RefineSearchTabletProps> = ({
  showRefineSearchDialog,
  filtersApplied,
  control,
  config,
  isTablet,
  onResetFields,
  onToggleDialog,
  onSubmit,
}) => {
  const { t } = useTranslation();

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

    const genderField = fields.find((field) => field.type === 'gender');
    const dobField = fields.find((field) => field.type === 'dateOfBirth');
    const otherFields = fields.filter((field) => !['gender', 'dateOfBirth'].includes(field.type));

    const otherFieldsRows = otherFields
      .reduce((rows, field, index) => {
        const rowIndex = Math.floor(index / 3);
        rows[rowIndex] = rows[rowIndex] || [];
        rows[rowIndex].push(field);
        return rows;
      }, [] as SearchFieldConfig[][])
      .map((row, index) => (
        <div key={index} className={styles.otherFieldsRow}>
          {row.map((field) => (
            <div key={field.name} className={styles.fieldTabletOrOverlay}>
              <SearchField field={field} control={control} inTabletOrOverlay={true} isTablet={isTablet} />
            </div>
          ))}
        </div>
      ));

    return (
      <>
        {Boolean(genderField || dobField) && (
          <div className={classNames(styles.padded, styles.refineSearchDialogGenderSexRow)}>
            {genderField && (
              <div className={styles.fieldTabletOrOverlay}>
                <SearchField field={genderField} control={control} inTabletOrOverlay={true} isTablet={isTablet} />
              </div>
            )}
            {dobField && (
              <div className={styles.fieldTabletOrOverlay}>
                <SearchField field={dobField} control={control} inTabletOrOverlay={true} isTablet={isTablet} />
              </div>
            )}
          </div>
        )}
        {otherFields.length > 0 && (
          <div className={classNames(styles.padded, styles.otherFieldsContainer)}>{otherFieldsRows}</div>
        )}
      </>
    );
  }, [config, control, isTablet]);

  return (
    <>
      <div className={styles.refineSearchBanner}>
        {!filtersApplied ? (
          <p className={styles.bodyShort01}>
            {t('refineSearchTabletBannerText', "Can't find who you're looking for?")}
          </p>
        ) : (
          <div className={styles.refineSearchBannerFilterInfo}>
            <span className={classNames(styles.filtersAppliedCount, styles.bodyShort01)}>{filtersApplied}</span>{' '}
            <p className={styles.bodyShort01}>{t('filtersAppliedText', 'search queries added')}</p>
            <Button kind="ghost" onClick={onResetFields} className={styles.refineSearchDialogOpener} size="sm">
              {t('clear', 'Clear')}
            </Button>
          </div>
        )}
        <Button
          kind="ghost"
          onClick={onToggleDialog}
          renderIcon={!showRefineSearchDialog ? ChevronUpIcon : ChevronDownIcon}
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
                onClick={onToggleDialog}
                renderIcon={ChevronDownIcon}
                className={styles.refineSearchDialogOpener}
                size="sm">
                {t('refineSearch', 'Refine search')}
              </Button>
            </div>
            <form onSubmit={onSubmit} role="refine-search-tablet">
              {renderSearchFields}
              <div className={classNames(styles.buttonSet, styles.paddedButtons)}>
                <Button kind="secondary" size="xl" onClick={onResetFields} className={styles.button}>
                  {t('resetFields', 'Reset fields')}
                </Button>
                <Button type="submit" kind="primary" size="xl" className={styles.button}>
                  {t('apply', 'Apply')}{' '}
                  {filtersApplied
                    ? `(${t('countOfFiltersApplied', '{{count}} filters applied', { count: filtersApplied })})`
                    : null}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
