import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { ComboBox, InlineLoading, Layer } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Field, useField } from 'formik';
import { type PersonAttributeTypeResponse } from '../../patient-registration.types';
import { useLocations } from './location-person-attribute-field.resource';
import styles from './../field.scss';

export interface LocationPersonAttributeFieldProps {
  id: string;
  personAttributeType: PersonAttributeTypeResponse;
  label?: string;
  locationTag: string;
  required?: boolean;
}

interface LocationOption {
  value: string;
  label: string;
}

/** A location reference, in the shape the REST API returns for a saved attribute. */
type LocationAttributeValue = { uuid: string; display?: string } | null;

export function LocationPersonAttributeField({
  personAttributeType,
  id,
  label,
  locationTag,
  required,
}: LocationPersonAttributeFieldProps) {
  const { t } = useTranslation();
  const fieldName = `attributes.${personAttributeType.uuid}`;
  const [, meta, { setValue }] = useField<LocationAttributeValue>(fieldName);
  const [searchQuery, setSearchQuery] = useState('');
  const downshiftActions: React.ComponentProps<typeof ComboBox<LocationOption>>['downshiftActions'] = useRef(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const enterPressedWithSearchText = useRef(false);
  const { locations, isLoading, loadingNewData } = useLocations(locationTag || null, searchQuery);
  const prevLocationOptions = useRef([]);

  const locationOptions = useMemo(() => {
    if (!(isLoading && loadingNewData)) {
      const newOptions = locations.map(({ resource: { id, name } }) => ({ value: id, label: name }));
      prevLocationOptions.current = newOptions;
      return newOptions;
    }
    return prevLocationOptions.current;
  }, [locations, isLoading, loadingNewData]);

  const savedUuid = meta.value?.uuid ?? '';
  const savedLabel = meta.value?.display;

  // Built from the saved value rather than from the search results, and kept referentially stable,
  // because ComboBox resets its input to the label of `selectedItem` whenever that prop changes.
  const selectedItem = useMemo<LocationOption | null>(
    () => (savedUuid && savedLabel ? { value: savedUuid, label: savedLabel } : null),
    [savedUuid, savedLabel],
  );

  // ComboBox doesn't pass `selectedItem` on to Downshift, which restores its own selection when the
  // input loses focus. Without this, leaving the field after typing would blank a saved location.
  useEffect(() => {
    downshiftActions.current?.selectItem(selectedItem);
  }, [selectedItem]);

  // ComboBox marks the selected option by reference, and the results may not include the saved location
  const items = useMemo(() => {
    if (!selectedItem) {
      return locationOptions;
    }
    const options = locationOptions.map((option) => (option.value === selectedItem.value ? selectedItem : option));
    return options.includes(selectedItem) ? options : [...options, selectedItem];
  }, [locationOptions, selectedItem]);

  const handleInputChange = useCallback(
    (value: string | null) => {
      if (value && value !== selectedItem?.label && !locationOptions.some(({ label }) => label === value)) {
        setSearchQuery(value);
      }
    },
    [locationOptions, selectedItem],
  );

  const handleSelect = useCallback(
    ({ selectedItem: item }: { selectedItem: LocationOption | null }) => {
      if (item) {
        if (item.value !== savedUuid) {
          setValue({ uuid: item.value, display: item.label });
        }
        return;
      }

      // ComboBox also reports a cleared selection when Enter matches no option. That keeps the saved location.
      if (enterPressedWithSearchText.current) {
        downshiftActions.current?.selectItem(selectedItem);
        return;
      }

      setValue(null);
    },
    [savedUuid, selectedItem, setValue],
  );

  return (
    <div
      className={classNames(styles.customField, styles.halfWidthInDesktopView, styles.locationAttributeFieldContainer)}
      onKeyDownCapture={(event) => {
        enterPressedWithSearchText.current =
          event.key === 'Enter' && event.target === inputRef.current && Boolean(inputRef.current.value);
      }}
      onPointerDownCapture={() => {
        enterPressedWithSearchText.current = false;
      }}>
      <Layer>
        <Field name={fieldName}>
          {({ form: { touched, errors } }) => {
            return (
              <ComboBox
                id={id}
                ref={inputRef}
                name={`person-attribute-${personAttributeType.uuid}`}
                titleText={label}
                items={items}
                placeholder={t('searchLocationPersonAttribute', 'Search location')}
                onInputChange={handleInputChange}
                required={required}
                onChange={handleSelect}
                selectedItem={selectedItem}
                downshiftActions={downshiftActions}
                invalid={errors[fieldName] && touched[fieldName]}
                typeahead
              />
            );
          }}
        </Field>
      </Layer>
      {loadingNewData && (
        <div className={styles.loadingContainer}>
          <InlineLoading />
        </div>
      )}
    </div>
  );
}
