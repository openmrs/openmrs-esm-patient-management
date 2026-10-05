import React, { useState, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useField, Field } from 'formik';
import { Button, RadioButton } from '@carbon/react';
import { TrashCan, Edit, Reset } from '@carbon/react/icons';
import { type RegistrationConfig } from '../../../../config-schema';
import { showModal, useConfig, userHasAccess, UserHasAccess, useSession } from '@openmrs/esm-framework';
import { deleteIdentifierType, setIdentifierSource } from '../../../field/id/id-field.component';
import { Input } from '../../basic-input/input/input.component';
import { usePatientRegistrationContext } from '../../../patient-registration-context';
import { useResourcesContext } from '../../../../resources-context';
import type { FormValues, PatientIdentifierType, PatientIdentifierValue } from '../../../patient-registration.types';
import styles from '../../input.scss';

/**
 * When the preferred identifier is deleted, marks another of the remaining identifiers as preferred so the
 * patient is not left without one. Falls back to the primary identifier type, then to the identifier that was
 * preferred when the form was loaded, then to the first identifier that has (or will be generated) a value.
 */
export function promoteFallbackPreferredIdentifier(
  identifiers: FormValues['identifiers'],
  identifierTypes: Array<PatientIdentifierType>,
  initialIdentifiers: FormValues['identifiers'],
): FormValues['identifiers'] {
  const remaining = Object.entries(identifiers);
  if (remaining.some(([, identifier]) => identifier.preferred)) {
    return identifiers;
  }

  const primaryTypeUuids = new Set(identifierTypes?.filter((type) => type.isPrimary).map((type) => type.uuid));
  const hasValue = (identifier: PatientIdentifierValue) =>
    !!identifier.identifierValue || (!!identifier.autoGeneration && !!identifier.selectedSource);

  const [fallbackFieldName] =
    remaining.find(([, identifier]) => primaryTypeUuids.has(identifier.identifierTypeUuid)) ??
    remaining.find(([fieldName, identifier]) => initialIdentifiers?.[fieldName]?.preferred && hasValue(identifier)) ??
    remaining.find(([, identifier]) => hasValue(identifier)) ??
    [];

  if (!fallbackFieldName) {
    return identifiers;
  }

  return {
    ...identifiers,
    [fallbackFieldName]: { ...identifiers[fallbackFieldName], preferred: true },
  };
}

interface IdentifierInputProps {
  patientIdentifier: PatientIdentifierValue;
  fieldName: string;
}

const IdentifierInput: React.FC<IdentifierInputProps> = ({ patientIdentifier, fieldName }) => {
  const { t } = useTranslation();
  const { defaultPatientIdentifierTypes, fieldConfigurations } = useConfig<RegistrationConfig>();
  const allowPreferredSelection = Boolean(fieldConfigurations?.identifier?.allowPreferredSelection);
  const { identifierTypes } = useResourcesContext();
  const { values, setFieldValue, setFieldTouched, initialFormValues, inEditMode } = usePatientRegistrationContext();
  const session = useSession();
  const canEditIdentifiers = userHasAccess('Edit Patient Identifiers', session?.user);
  const identifierType = useMemo(
    () => identifierTypes.find((identifierType) => identifierType.uuid === patientIdentifier.identifierTypeUuid),
    [patientIdentifier, identifierTypes],
  );
  const { autoGeneration, initialValue, identifierValue, identifierName, preferred, required, selectedSource } =
    patientIdentifier;
  const manualEntryEnabled = selectedSource?.autoGenerationOption?.manualEntryEnabled;
  const [hideInputField, setHideInputField] = useState(autoGeneration || initialValue === identifierValue);
  const name = `identifiers.${fieldName}.identifierValue`;
  const [identifierField, identifierFieldMeta] = useField(name);

  const defaultPatientIdentifierTypesMap = useMemo(() => {
    const map = {};
    defaultPatientIdentifierTypes?.forEach((typeUuid) => {
      map[typeUuid] = true;
    });
    return map;
  }, [defaultPatientIdentifierTypes]);

  const validateInput = (value: string) => {
    if (!value || value === '') {
      return;
    }

    if (!identifierType?.format) {
      return;
    }

    try {
      const regex = new RegExp(identifierType.format);
      if (regex.test(value)) {
        return;
      }

      return identifierType.formatDescription ?? `Expected format: ${identifierType.format}`;
    } catch (e) {
      console.error('Invalid regex pattern:', identifierType.format);
      return;
    }
  };

  const handleReset = useCallback(() => {
    setHideInputField(true);
    setFieldValue(`identifiers.${fieldName}`, {
      ...patientIdentifier,
      identifierValue: initialValue,
      selectedSource,
      autoGeneration,
    } as PatientIdentifierValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, setHideInputField]);

  const handleEdit = () => {
    setHideInputField(false);
    setFieldValue(`identifiers.${fieldName}`, {
      ...patientIdentifier,
      ...setIdentifierSource(identifierType?.identifierSources?.[0], initialValue, initialValue),
      ...(autoGeneration && manualEntryEnabled && { identifierValue: initialValue ?? '' }),
    });
  };

  const handleSelectPreferred = () => {
    setFieldValue(
      'identifiers',
      Object.fromEntries(
        Object.entries(values.identifiers).map(([identifierFieldName, identifier]) => [
          identifierFieldName,
          { ...identifier, preferred: identifierFieldName === fieldName },
        ]),
      ),
    );
    // Show straight away that the preferred identifier needs a value. setFieldValue has already validated the
    // updated values, so marking the field as touched does not need to validate again.
    setFieldTouched(name, true, false);
  };

  const deleteIdentifier = () => {
    const remainingIdentifiers = deleteIdentifierType(values.identifiers, fieldName);
    // For an existing patient, saving the promoted fallback needs the edit privilege. Without it, leave the choice
    // to the backend, which picks a new preferred identifier when the deleted one is purged.
    const canPromoteFallback = !inEditMode || canEditIdentifiers;
    setFieldValue(
      'identifiers',
      allowPreferredSelection && preferred && canPromoteFallback
        ? promoteFallbackPreferredIdentifier(remainingIdentifiers, identifierTypes, initialFormValues?.identifiers)
        : remainingIdentifiers,
    );
  };

  const handleDelete = () => {
    /*
    If there is an initialValue to the identifier, a confirmation modal seeking
    confirmation to delete the identifier should be shown, else in the other case,
    we can directly delete the identifier.
    */

    if (initialValue) {
      const dispose = showModal('delete-identifier-confirmation-modal', {
        closeModal: () => dispose(),
        deleteIdentifier: (isConfirmed) => {
          if (isConfirmed) {
            deleteIdentifier();
          }
          dispose();
        },
        identifierName,
        identifierValue: initialValue,
      });
    } else {
      deleteIdentifier();
    }
  };

  const renderPreferredRadioButton = (disabled = false) => (
    <RadioButton
      id={`identifiers.${fieldName}.preferred`}
      name="preferredIdentifier"
      value={fieldName}
      labelText={t('preferredIdentifierLabel', 'Preferred')}
      aria-label={t('markIdentifierAsPreferred', 'Mark {{identifierName}} as preferred', { identifierName })}
      checked={!!preferred}
      onChange={handleSelectPreferred}
      className={styles.preferredIdentifier}
      disabled={disabled}
    />
  );

  // A preferred identifier needs a value (see the validation schema), so it is not labelled as optional.
  const valueRequired = required || (allowPreferredSelection && preferred && !autoGeneration);

  const showEditButton = !required && hideInputField && (!!initialValue || manualEntryEnabled);
  const showResetButton =
    (!!initialValue && initialValue !== identifierValue) || (!hideInputField && manualEntryEnabled);
  return (
    <div className={styles.IDInput}>
      {!hideInputField ? (
        <Field name={name} validate={validateInput}>
          {({ field, form: { touched, errors } }) => (
            <Input
              id={name}
              labelText={identifierName}
              name={name}
              required={required}
              hideOptionalLabel={valueRequired}
              invalid={errors[name] && touched[name]}
              invalidText={errors[name] && t(errors[name])}
              {...field}
            />
          )}
        </Field>
      ) : (
        <div className={styles.textID}>
          <p data-testid="identifier-label" className={styles.label}>
            {valueRequired ? identifierName : `${t('optionalIdentifierLabel', { identifierName })}`}
          </p>
          <p data-testid="identifier-placeholder" className={styles.bodyShort02}>
            {autoGeneration ? t('autoGeneratedPlaceholderText', 'Auto-generated') : identifierValue}
          </p>
          <input data-testid="identifier-input" type="hidden" {...identifierField} disabled />
          {/* This is added for any error descriptions */}
          {!!(identifierFieldMeta.touched && identifierFieldMeta.error) && (
            <span className={styles.dangerLabel01}>{identifierFieldMeta.error && t(identifierFieldMeta.error)}</span>
          )}
        </div>
      )}
      <div className={styles.actionButtonContainer}>
        {/* Changing the preferred identifier of an existing patient updates their saved identifiers, so users
            without the privilege see a read-only option that still shows which identifier is preferred */}
        {allowPreferredSelection &&
          (inEditMode ? (
            <UserHasAccess privilege="Edit Patient Identifiers" fallback={renderPreferredRadioButton(true)}>
              {renderPreferredRadioButton()}
            </UserHasAccess>
          ) : (
            renderPreferredRadioButton()
          ))}
        <div
          className={classNames(styles.identifierActions, {
            [styles.reserveActionSpace]: allowPreferredSelection,
          })}>
          {showEditButton && (
            <UserHasAccess privilege="Edit Patient Identifiers">
              <Button
                data-testid="edit-button"
                size="md"
                kind="ghost"
                onClick={handleEdit}
                iconDescription={t('editIdentifierTooltip', 'Edit')}
                hasIconOnly>
                <Edit size={16} />
              </Button>
            </UserHasAccess>
          )}
          {showResetButton && (
            <UserHasAccess privilege="Edit Patient Identifiers">
              <Button
                size="md"
                kind="ghost"
                onClick={handleReset}
                iconDescription={t('resetIdentifierTooltip', 'Reset')}
                hasIconOnly>
                <Reset size={16} />
              </Button>
            </UserHasAccess>
          )}
          {!patientIdentifier.required && !defaultPatientIdentifierTypesMap[patientIdentifier.identifierTypeUuid] && (
            <UserHasAccess privilege="Delete Patient Identifiers">
              <Button
                size="md"
                kind="ghost"
                onClick={handleDelete}
                iconDescription={t('deleteIdentifierTooltip', 'Delete')}
                hasIconOnly>
                <TrashCan size={16} />
              </Button>
            </UserHasAccess>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdentifierInput;
