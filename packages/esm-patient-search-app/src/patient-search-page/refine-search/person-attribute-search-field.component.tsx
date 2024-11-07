import React, { useMemo } from 'react';
import { ComboBox, InlineNotification, TextInput, TextInputSkeleton } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useAttributeConceptAnswers, useLocations, usePersonAttributeType } from './person-attributes.resource';
import { type SearchFieldConfig } from '../../types';

interface PersonAttributeSearchFieldProps {
  field: SearchFieldConfig;
  formState: any;
  inTabletOrOverlay: boolean;
  isTablet: boolean;
  onInputChange: (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => void;
}

const ConceptAttributeField = ({
  field,
  formState,
  isTablet,
  onInputChange,
  attributeDisplay,
}: {
  field: SearchFieldConfig;
  formState: any;
  isTablet: boolean;
  onInputChange: (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => void;
  attributeDisplay: string;
}) => {
  const { t } = useTranslation();
  const { data: conceptAnswers, isLoading } = useAttributeConceptAnswers(field.answerConceptSetUuid);
  const handleChange = onInputChange(field.name);

  const items = useMemo(() => {
    if (!conceptAnswers) return field.customConceptAnswers || [];
    return [
      ...(field.customConceptAnswers || []),
      ...conceptAnswers.map((answer) => ({ uuid: answer.uuid, label: answer.display })),
    ];
  }, [conceptAnswers, field.customConceptAnswers]);

  if (isLoading) {
    return <TextInputSkeleton />;
  }

  return (
    <ComboBox
      id={field.name}
      titleText={t(field.label || attributeDisplay)}
      items={items}
      selectedItem={items.find((item) => item.uuid === formState[field.name])}
      onChange={({ selectedItem }) => handleChange({ target: { value: selectedItem?.uuid } })}
      placeholder={t('selectOption', 'Select an option')}
      size={isTablet ? 'lg' : 'md'}
    />
  );
};

const LocationAttributeField = ({
  field,
  formState,
  isTablet,
  onInputChange,
  attributeDisplay,
}: {
  field: SearchFieldConfig;
  formState: any;
  isTablet: boolean;
  onInputChange: (fieldName: string) => (evt: { target: { value: string } } | { name: string }) => void;
  attributeDisplay: string;
}) => {
  const { t } = useTranslation();
  const { locations, isLoading } = useLocations(field.locationTag);
  const handleChange = onInputChange(field.name);

  const items = useMemo(() => {
    return locations.map(({ resource }) => ({
      uuid: resource.id,
      label: resource.name,
    }));
  }, [locations]);

  if (isLoading) {
    return <TextInputSkeleton />;
  }

  return (
    <ComboBox
      id={field.name}
      titleText={t(field.label || attributeDisplay)}
      items={items}
      selectedItem={items.find((item) => item.uuid === formState[field.name])}
      onChange={({ selectedItem }) => handleChange({ target: { value: selectedItem?.uuid } })}
      placeholder={field.placeholder ? t(field.placeholder) : ''}
      size={isTablet ? 'lg' : 'md'}
    />
  );
};

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
            value={formState[field.name] || ''}
            onChange={(e: { target: { value: any } }) =>
              onInputChange(field.name)({ target: { value: e.target.value } })
            }
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
