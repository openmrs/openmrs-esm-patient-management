import React, { useMemo, useRef, useState } from 'react';
import { ComboBox, InlineLoading, InlineNotification, TextInput, TextInputSkeleton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type Control, Controller } from 'react-hook-form';
import {
  useAttributeConceptAnswers,
  useConfiguredAnswerConcepts,
  useLocations,
  usePersonAttributeType,
} from './person-attributes.resource';
import { type AdvancedPatientSearchState, type SearchFieldConfig } from '../../types';
import styles from './search-field.scss';
import { type OpenmrsResource } from '@openmrs/esm-framework';

export interface PersonAttributeFieldProps {
  field: SearchFieldConfig;
  control: Control<AdvancedPatientSearchState>;
  inTabletOrOverlay: boolean;
  isTablet: boolean;
}

export function PersonAttributeField({ field, control, isTablet }: PersonAttributeFieldProps) {
  const { t } = useTranslation();
  const { data: personAttributeType, isLoading, error } = usePersonAttributeType(field.attributeTypeUuid || '');

  const formatField = useMemo(() => {
    if (!personAttributeType || isLoading) {
      return <TextInputSkeleton />;
    }

    switch (personAttributeType.format) {
      case 'java.lang.String':
        return (
          <Controller
            name={`attributes.${field.name}`}
            control={control}
            defaultValue=""
            render={({ field: { onChange, value } }) => (
              <TextInput
                id={field.name}
                labelText={t(personAttributeType.display)}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={field.placeholder}
                size={isTablet ? 'lg' : 'md'}
              />
            )}
          />
        );

      case 'org.openmrs.Concept':
        return (
          <ConceptAttributeField
            field={field}
            control={control}
            isTablet={isTablet}
            attributeDisplay={personAttributeType.display}
          />
        );

      case 'org.openmrs.Location':
        return (
          <LocationAttributeField
            field={field}
            control={control}
            isTablet={isTablet}
            attributeDisplay={personAttributeType.display}
          />
        );

      default:
        return (
          <InlineNotification kind="error" title={t('error', 'Error')}>
            {t('unsupportedAttributeFormat', 'Unsupported attribute format: {{format}}', {
              format: personAttributeType.format,
            })}
          </InlineNotification>
        );
    }
  }, [personAttributeType, isLoading, field, control, t, isTablet]);

  if (error) {
    return (
      <InlineNotification kind="error" title={t('error', 'Error')}>
        {t('errorLoadingAttribute', 'Error loading attribute type {{attributeUuid}}', {
          attributeUuid: field.attributeTypeUuid,
        })}
      </InlineNotification>
    );
  }

  return formatField;
}

interface ConceptAttributeFieldProps {
  field: SearchFieldConfig;
  control: Control<AdvancedPatientSearchState>;
  isTablet: boolean;
  attributeDisplay: string;
}

const ConceptAttributeField: React.FC<ConceptAttributeFieldProps> = ({
  field,
  control,
  isTablet,
  attributeDisplay,
}) => {
  const { t } = useTranslation();
  const { configuredConceptAnswers, isLoadingConfiguredAnswers } = useConfiguredAnswerConcepts(
    field.conceptAnswersUuids ?? [],
  );
  const { conceptAnswers, isLoadingConceptAnswers, errorFetchingConceptAnswers } = useAttributeConceptAnswers(
    field.conceptAnswersUuids?.length ? '' : field.answerConceptSetUuid,
  );

  const items = useMemo(() => {
    if (isLoadingConceptAnswers || isLoadingConfiguredAnswers) return [];
    if (field.conceptAnswersUuids?.length) return configuredConceptAnswers || [];
    return conceptAnswers || [];
  }, [
    isLoadingConceptAnswers,
    isLoadingConfiguredAnswers,
    field.conceptAnswersUuids,
    configuredConceptAnswers,
    conceptAnswers,
  ]);

  if (isLoadingConceptAnswers || isLoadingConfiguredAnswers) {
    return <TextInputSkeleton />;
  }

  if (errorFetchingConceptAnswers) {
    return (
      <InlineNotification kind="error" title={t('error', 'Error')}>
        {t('errorLoadingConceptAttributeAnswers', 'Error loading concept attribute answers')}
      </InlineNotification>
    );
  }

  return (
    <Controller
      name={`attributes.${field.name}`}
      control={control}
      defaultValue=""
      render={({ field: { onChange, value } }) => (
        <ComboBox
          id={field.name}
          titleText={t(attributeDisplay)}
          items={items}
          itemToString={(item: OpenmrsResource) => item?.display}
          selectedItem={items.sort((a, b) => a.display.localeCompare(b.display)).find((item) => item.uuid === value)}
          onChange={({ selectedItem }) => onChange(selectedItem?.uuid)}
          placeholder={t('selectOption', 'Select an option')}
          size={isTablet ? 'lg' : 'md'}
        />
      )}
    />
  );
};

interface LocationAttributeFieldProps {
  field: SearchFieldConfig;
  control: Control<AdvancedPatientSearchState>;
  isTablet: boolean;
  attributeDisplay: string;
}

const LocationAttributeField: React.FC<LocationAttributeFieldProps> = ({
  field,
  control,
  isTablet,
  attributeDisplay,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { locations, isLoading, loadingNewData, error } = useLocations(field.locationTag || null, searchQuery);
  const prevLocationOptions = useRef([]);

  const locationOptions = useMemo(() => {
    if (!(isLoading && loadingNewData)) {
      const newOptions = locations.map(({ resource }) => ({
        value: resource.id,
        label: resource.name,
      }));
      prevLocationOptions.current = newOptions;
      return newOptions;
    }
    return prevLocationOptions.current;
  }, [locations, isLoading, loadingNewData]);

  if (error) {
    return (
      <InlineNotification kind="error" title={t('error', 'Error')}>
        {t('errorLoadingLocationsForAttribute', 'Error loading locations for person attribute {{attributeName}}', {
          attributeName: attributeDisplay,
        })}
      </InlineNotification>
    );
  }

  return (
    <div className={styles.locationAttributeFieldContainer}>
      <Controller
        name={`attributes.${field.name}`}
        control={control}
        defaultValue=""
        render={({ field: { onChange, value } }) => (
          <ComboBox
            id={field.name}
            titleText={t(attributeDisplay)}
            items={locationOptions}
            selectedItem={locationOptions.find((option) => option.value === value)}
            onChange={({ selectedItem }) => onChange(selectedItem?.value)}
            onInputChange={(inputValue) => {
              if (inputValue && !locationOptions.find(({ label }) => label === inputValue)) {
                setSearchQuery(inputValue);
                onChange('');
              }
            }}
            placeholder={t('searchLocationPersonAttribute', 'Search location')}
            size={isTablet ? 'lg' : 'md'}
            typeahead
          />
        )}
      />
      {loadingNewData && (
        <div className={styles.loadingContainer}>
          <InlineLoading />
        </div>
      )}
    </div>
  );
};
