import React, { useCallback, useMemo, useState, useEffect } from 'react';
import classNames from 'classnames';
import { useField } from 'formik';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import styles from './../field.scss';
import { useLocations } from './location-person-attribute-field.resource';
import { ComboBox, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
export interface LocationPersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  validationRegex?: string;
  label?: string;
  locationTag: string;
  required?: boolean;
}

export function LocationPersonAttributeField({
  personAttributeType,
  id,
  label,
  locationTag,
  required,
}: LocationPersonAttributeFieldProps) {
  const { t } = useTranslation();
  const [field, meta, { setValue }] = useField(`attributes.${personAttributeType.uuid}`);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { locations } = useLocations(locationTag || null, 5, searchQuery);

  const locationOptions = useMemo(() => {
    return locations.map(({ resource: { id, name } }) => ({ value: id, label: name }));
  }, [locations]);

  useEffect(() => {
    if (meta?.value?.uuid) {
      setValue(meta.value.uuid);
    }
  }, [meta, setValue]);

  const onInputChange = useCallback(
    (value: string | null) => {
      if (value) {
        if (locationOptions.find(({ label }) => label === value)) return;
        setSearchQuery(value);
        setValue(null);
      }
    },
    [locationOptions, setValue],
  );

  const handleSelect = useCallback(
    ({ selectedItem }) => {
      if (selectedItem) {
        setValue(selectedItem.value);
      }
    },
    [setValue],
  );

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <Layer>
        <ComboBox
          titleText={label}
          items={locationOptions}
          id={id}
          placeholder={t('searchLocationPersonAttribute', 'Search location')}
          onInputChange={onInputChange}
          required={required}
          onChange={handleSelect}
          selectedItem={locationOptions.find(({ value }) => value === field.value) || null}
        />
      </Layer>
    </div>
  );
}
