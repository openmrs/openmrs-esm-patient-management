import React, { useEffect, useRef } from 'react';
import { getIn, useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useConfig } from '@openmrs/esm-framework';
import { AddressField } from './address/custom-address-field.component';
import { ObsField } from './obs/obs-field.component';
import { PersonAttributeField } from './person-attributes/person-attribute-field.component';
import { type FieldDefinition, type RegistrationConfig } from '../../config-schema';
import { type FormValues } from '../patient-registration.types';
import styles from './field.scss';

export interface CustomFieldProps {
  name: string;
}

export function CustomField({ name }: CustomFieldProps) {
  const { t } = useTranslation();
  const config = useConfig<RegistrationConfig>();
  const fieldDefinition = config.fieldDefinitions.filter((def) => def.id === name)[0];
  const isShown = useShowWhen(fieldDefinition, config.fieldDefinitions);

  if (!isShown) {
    return null;
  } else if (fieldDefinition.type === 'person attribute') {
    return <PersonAttributeField fieldDefinition={fieldDefinition} />;
  } else if (fieldDefinition.type === 'obs') {
    return <ObsField fieldDefinition={fieldDefinition} />;
  } else if (fieldDefinition.type === 'text') {
    return <p className={styles.textField}>{t(`${fieldDefinition.id}Text`, fieldDefinition.label)}</p>;
  } else if (fieldDefinition.type === 'address') {
    return <AddressField fieldDefinition={fieldDefinition} />;
  } else {
    return <div>Error: Unknown field type {fieldDefinition.type}</div>;
  }
}

function formValuePath(fieldDefinition: FieldDefinition) {
  if (fieldDefinition?.type === 'person attribute') {
    return `attributes.${fieldDefinition.uuid}`;
  } else if (fieldDefinition?.type === 'obs') {
    return `obs.${fieldDefinition.uuid}`;
  }
  return null;
}

/** Whether the field's `showWhen` condition holds. Clears the field's value when the condition stops holding. */
function useShowWhen(fieldDefinition: FieldDefinition, fieldDefinitions: Array<FieldDefinition>) {
  const formik = useFormikContext<FormValues>();
  const controllingField = fieldDefinition.showWhen?.field
    ? fieldDefinitions.find((def) => def.id === fieldDefinition.showWhen.field)
    : null;
  const controllingPath = formValuePath(controllingField);
  const isShown = !controllingPath || fieldDefinition.showWhen.answers.includes(getIn(formik?.values, controllingPath));

  const wasShown = useRef(isShown);
  const ownPath = formValuePath(fieldDefinition);
  const setFieldValue = formik?.setFieldValue;
  useEffect(() => {
    // Only on the change from shown to hidden, so a saved value is kept when a patient loads with the field hidden.
    if (wasShown.current && !isShown && ownPath) {
      setFieldValue(ownPath, '');
    }
    wasShown.current = isShown;
  }, [isShown, ownPath, setFieldValue]);

  return isShown;
}
