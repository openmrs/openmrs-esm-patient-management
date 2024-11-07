import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { ChevronDownIcon, ChevronUpIcon } from '@openmrs/esm-framework';
import { type AdvancedPatientSearchState, type SearchFieldConfig, type SearchFieldType } from '../../types';
import { type PatientSearchConfig, type PersonAttributeFieldConfig } from '../../config-schema';
import { SearchField } from './search-field.component';
import styles from './refine-search-tablet.scss';

interface RefineSearchTabletProps {
  showRefineSearchDialog: boolean;
  filtersApplied: number;
  formState: AdvancedPatientSearchState;
  config: PatientSearchConfig;
  isTablet: boolean;
  onResetFields: () => void;
  onToggleDialog: () => void;
  onSubmit: (evt: React.FormEvent) => void;
  onInputChange: (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => void;
  onDateOfBirthChange: (dateComponent: 'date' | 'month' | 'year') => (evt: { target: { value: string } }) => void;
}

export const RefineSearchTablet: React.FC<RefineSearchTabletProps> = ({
  showRefineSearchDialog,
  filtersApplied,
  formState,
  config,
  isTablet,
  onResetFields,
  onToggleDialog,
  onSubmit,
  onInputChange,
  onDateOfBirthChange,
}) => {
  const { t } = useTranslation();

  const renderSearchFields = () => {
    const fields: Array<SearchFieldConfig> = [];

    Object.entries(config.search.searchFields.fields).forEach(([fieldName, fieldConfig]) => {
      if (fieldConfig.enabled) {
        fields.push({
          name: fieldName,
          type: fieldName as SearchFieldType,
          label: fieldConfig.label,
        });
      }
    });

    config.search.searchFields.personAttributes?.forEach((attribute: PersonAttributeFieldConfig) => {
      fields.push({
        name: attribute.attributeTypeUuid,
        type: 'personAttribute',
        label: attribute.label,
        attributeTypeUuid: attribute.attributeTypeUuid,
        ...attribute,
      });
    });

    const genderField = fields.find((field) => field.type === 'gender');
    const dobField = fields.find((field) => field.type === 'dateOfBirth');
    const otherFields = fields.filter((field) => !['gender', 'dateOfBirth'].includes(field.type));

    const renderOtherFields = () => {
      const rows: SearchFieldConfig[][] = [];
      for (let i = 0; i < otherFields.length; i += 3) {
        rows.push(otherFields.slice(i, i + 3));
      }

      return rows.map((row, index) => (
        <div key={index} className={styles.otherFieldsRow}>
          {row.map((field) => (
            <div key={field.name} className={styles.fieldTabletOrOverlay}>
              <SearchField
                field={field}
                formState={formState}
                inTabletOrOverlay={true}
                isTablet={isTablet}
                onInputChange={onInputChange}
                onDateOfBirthChange={onDateOfBirthChange}
              />
            </div>
          ))}
        </div>
      ));
    };

    return (
      <>
        {(genderField || dobField) && (
          <div className={classNames(styles.padded, styles.refineSearchDialogGenderSexRow)}>
            {genderField && (
              <div className={styles.fieldTabletOrOverlay}>
                <SearchField
                  field={genderField}
                  formState={formState}
                  inTabletOrOverlay={true}
                  isTablet={isTablet}
                  onInputChange={onInputChange}
                  onDateOfBirthChange={onDateOfBirthChange}
                />
              </div>
            )}
            {dobField && (
              <div className={styles.fieldTabletOrOverlay}>
                <SearchField
                  field={dobField}
                  formState={formState}
                  inTabletOrOverlay={true}
                  isTablet={isTablet}
                  onInputChange={onInputChange}
                  onDateOfBirthChange={onDateOfBirthChange}
                />
              </div>
            )}
          </div>
        )}
        {otherFields.length > 0 && (
          <div className={classNames(styles.padded, styles.otherFieldsContainer)}>{renderOtherFields()}</div>
        )}
      </>
    );
  };

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
            <form onSubmit={onSubmit}>
              {renderSearchFields()}
              <div className={classNames(styles.buttonSet, styles.paddedButtons)}>
                <Button kind="secondary" size="xl" onClick={onResetFields} className={styles.button}>
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
};
