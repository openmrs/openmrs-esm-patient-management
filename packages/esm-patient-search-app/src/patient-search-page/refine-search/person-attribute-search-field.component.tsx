import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ComboBox, InlineLoading, InlineNotification, TextInput, TextInputSkeleton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useAttributeConceptAnswers, useLocations, usePersonAttributeType } from './person-attributes.resource';
import { type AdvancedPatientSearchState, type SearchFieldConfig } from '../../types';
import styles from './search-field.scss';

interface PersonAttributeSearchFieldProps {
  field: SearchFieldConfig;
  formState: AdvancedPatientSearchState;
  inTabletOrOverlay: boolean;
  isTablet: boolean;
  onInputChange: (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => void;
}

export function PersonAttributeSearchField({
  field,
  formState,
  isTablet,
  onInputChange,
}: PersonAttributeSearchFieldProps) {
  const { t } = useTranslation();
  const { data: personAttributeType, isLoading, error } = usePersonAttributeType(field.attributeTypeUuid);

  const formatField = useMemo(() => {
    if (!personAttributeType || isLoading) {
      return <TextInputSkeleton />;
    }

    switch (personAttributeType.format) {
      case 'java.lang.String':
        return (
          <TextInput
            id={field.name}
            labelText={t(field.label || personAttributeType.display)}
            value={formState.attributes[field.name] || ''}
            onChange={(e: { target: { value: any } }) => {
              onInputChange(field.name)({ target: { value: e.target.value } });
            }}
            placeholder={field.placeholder}
            size={isTablet ? 'lg' : 'md'}
          />
        );

      case 'org.openmrs.Concept':
        return (
          <ConceptAttributeField
            field={field}
            formState={formState}
            isTablet={isTablet}
            onInputChange={onInputChange}
            attributeDisplay={personAttributeType.display}
          />
        );

      case 'org.openmrs.Location':
        return (
          <LocationAttributeField
            field={field}
            formState={formState}
            isTablet={isTablet}
            onInputChange={onInputChange}
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
  }, [personAttributeType, isLoading, field, formState, onInputChange, t, isTablet]);

  if (error) {
    return (
      <InlineNotification kind="error" title={t('error', 'Error')}>
        {t('errorLoadingAttribute', 'Error loading attribute type')}
      </InlineNotification>
    );
  }

  return formatField;
}

const ConceptAttributeField = ({
  field,
  formState,
  isTablet,
  onInputChange,
  attributeDisplay,
}: {
  field: SearchFieldConfig;
  formState: AdvancedPatientSearchState;
  isTablet: boolean;
  onInputChange: (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => void;
  attributeDisplay: string;
}) => {
  const { t } = useTranslation();
  const { data: conceptAnswers, isLoading } = useAttributeConceptAnswers(
    field.customConceptAnswers.length ? '' : field.answerConceptSetUuid,
  );
  const handleChange = onInputChange(field.name);

  const items = useMemo(() => {
    if (field.customConceptAnswers.length) return field.customConceptAnswers;
    if (!conceptAnswers || !isLoading) return [];
    return conceptAnswers
      .map((answer) => ({
        uuid: answer.uuid,
        label: answer.display,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [conceptAnswers, field.customConceptAnswers, isLoading]);

  if (isLoading) {
    return <TextInputSkeleton />;
  }

  return (
    <ComboBox
      id={field.name}
      titleText={t(field.label || attributeDisplay)}
      items={items}
      selectedItem={items.find((item) => item.uuid === formState.attributes[field.name])}
      onChange={({ selectedItem }) => handleChange({ target: { value: selectedItem?.uuid } })}
      placeholder={t('selectOption', 'Select an option')}
      size={isTablet ? 'lg' : 'md'}
    />
  );
};

interface LocationAttributeFieldProps {
  field: SearchFieldConfig;
  formState: AdvancedPatientSearchState;
  isTablet: boolean;
  onInputChange: (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => void;
  attributeDisplay: string;
}

const LocationAttributeField = ({
  field,
  formState,
  isTablet,
  onInputChange,
  attributeDisplay,
}: LocationAttributeFieldProps) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { locations, isLoading, loadingNewData } = useLocations(field.locationTag || null, searchQuery);
  const prevLocationOptions = useRef([]);
  const handleChange = onInputChange(field.name);

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

  const selectedItem = useMemo(() => {
    const currentValue = formState.attributes[field.name];
    if (!currentValue) return null;

    return locationOptions.find(({ value }) => value === currentValue) || null;
  }, [locationOptions, formState.attributes, field.name]);

  const handleInputChange = useCallback(
    (value: string | null) => {
      if (value) {
        // If the value exists in the locationOptions, exit the function
        if (locationOptions.find(({ label }) => label === value)) return;
        // If the input is a new value, set the search query
        setSearchQuery(value);
        // Clear the current selected value
        handleChange({ target: { value: null } });
      }
    },
    [locationOptions, handleChange],
  );

  const handleSelect = useCallback(
    ({ selectedItem }) => {
      if (selectedItem) {
        handleChange({ target: { value: selectedItem.value } });
      }
    },
    [handleChange],
  );

  return (
    <div className={styles.locationAttributeFieldContainer}>
      <ComboBox
        id={field.name}
        titleText={t(field.label || attributeDisplay)}
        items={locationOptions}
        selectedItem={selectedItem}
        onChange={handleSelect}
        onInputChange={handleInputChange}
        placeholder={t('searchLocationPersonAttribute', 'Search location')}
        size={isTablet ? 'lg' : 'md'}
        typeahead
      />
      {loadingNewData && (
        <div className={styles.loadingContainer}>
          <InlineLoading />
        </div>
      )}
    </div>
  );
};
