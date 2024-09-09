import React, { useMemo, useCallback, useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Checkbox, Search, RadioButtonGroup, RadioButton } from '@carbon/react';
import { isDesktop, useConfig, useLayoutType } from '@openmrs/esm-framework';
import { type FormValues, type PatientIdentifierType, PatientIdentifierValue } from '../../patient-registration.types';
import Overlay from '../../ui-components/overlay/overlay.component';
import { ResourcesContext } from '../../../offline.resources';
import { PatientRegistrationContext } from '../../patient-registration-context';
import {
  isUniqueIdentifierTypeForOffline,
  shouldBlockPatientIdentifierInOfflineMode,
} from '../../input/custom-input/identifier/utils';
import { initializeIdentifier, setIdentifierSource } from './id-field.component';
import styles from './identifier-selection.scss';
import { type UseFormSetValue } from 'react-hook-form';

interface PatientIdentifierOverlayProps {
  setFieldValue: UseFormSetValue<FormValues>;
  closeOverlay: () => void;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({ closeOverlay, setFieldValue }) => {
  const layout = useLayoutType();
  const { identifierTypes } = useContext(ResourcesContext);
  const {
    isOffline,
    watch,
    formState: { defaultValues },
  } = useContext(PatientRegistrationContext);
  const identifiers = watch('identifiers');
  const [unsavedIdentifierTypes, setUnsavedIdentifierTypes] = useState<FormValues['identifiers']>(identifiers);
  const [searchString, setSearchString] = useState<string>('');
  const { t } = useTranslation();
  const { defaultPatientIdentifierTypes } = useConfig();
  const defaultPatientIdentifierTypesMap = useMemo(() => {
    const map = {};
    defaultPatientIdentifierTypes?.forEach((typeUuid) => {
      map[typeUuid] = true;
    });
    return map;
  }, [defaultPatientIdentifierTypes]);

  useEffect(() => {
    setUnsavedIdentifierTypes(identifiers);
  }, [identifiers]);

  const handleSearch = useCallback((event) => setSearchString(event?.target?.value ?? ''), []);

  const filteredIdentifiers = useMemo(
    () => identifierTypes?.filter((identifier) => identifier?.name?.toLowerCase().includes(searchString.toLowerCase())),
    [searchString, identifierTypes],
  );

  const handleCheckingIdentifier = useCallback(
    (identifierType: PatientIdentifierType, checked: boolean) =>
      setUnsavedIdentifierTypes((unsavedIdentifierTypes) => {
        if (checked) {
          return {
            ...unsavedIdentifierTypes,
            [identifierType.fieldName]: initializeIdentifier(
              identifierType,
              identifiers[identifierType.fieldName] ?? defaultValues.identifiers[identifierType.fieldName] ?? {},
            ),
          };
        }
        if (unsavedIdentifierTypes[identifierType.fieldName]) {
          return Object.fromEntries(
            Object.entries(unsavedIdentifierTypes).filter(([fieldName]) => fieldName !== identifierType.fieldName),
          );
        }
        return unsavedIdentifierTypes;
      }),
    [defaultValues.identifiers, identifiers],
  );

  const handleSelectingIdentifierSource = (identifierType: PatientIdentifierType, sourceUuid) =>
    setUnsavedIdentifierTypes((unsavedIdentifierTypes) => ({
      ...unsavedIdentifierTypes,
      [identifierType.fieldName]: {
        ...unsavedIdentifierTypes[identifierType.fieldName],
        ...setIdentifierSource(
          identifierType.identifierSources.find((source) => source.uuid === sourceUuid),
          unsavedIdentifierTypes[identifierType.fieldName].identifierValue,
          unsavedIdentifierTypes[identifierType.fieldName].initialValue,
        ),
      },
    }));

  const identifierTypeFields = useMemo(
    () =>
      filteredIdentifiers.map((identifierType) => {
        const patientIdentifier = unsavedIdentifierTypes[identifierType.fieldName];
        const isDisabled =
          identifierType.isPrimary ||
          identifierType.required ||
          defaultPatientIdentifierTypesMap[identifierType.uuid] ||
          // De-selecting shouldn't be allowed if the identifier was selected earlier and is present in the form.
          // If the user wants to de-select an identifier-type already present in the form, they'll need to delete the particular identifier from the form itself.
          identifiers[identifierType.fieldName];
        const isDisabledOffline = isOffline && shouldBlockPatientIdentifierInOfflineMode(identifierType);

        return (
          <div key={identifierType.uuid} className={styles.space05}>
            <Checkbox
              id={identifierType.uuid}
              value={identifierType.uuid}
              labelText={identifierType.name}
              onChange={(e, { checked }) => handleCheckingIdentifier(identifierType, checked)}
              checked={!!patientIdentifier}
              disabled={isDisabled || (isOffline && isDisabledOffline)}
            />
            {patientIdentifier &&
              identifierType?.identifierSources?.length > 0 &&
              /* 
                This check are for the cases when there's an initialValue identifier is assigned
                to the patient
                The corresponding flow is like:
                1. If there's no change to the actual initial identifier, then the source remains null, 
                hence the list of the identifier sources shouldn't be displayed.
                2. If user wants to edit the patient identifier's value, hence there will be an initialValue,
                along with a source assigned to itself(only if the identifierType has sources, else there's nothing to worry about), which by
                default is the first identifierSource
              */
              (!patientIdentifier.initialValue || patientIdentifier?.selectedSource) && (
                <div className={styles.radioGroup}>
                  <RadioButtonGroup
                    legendText={t('source', 'Source')}
                    name={`${identifierType?.fieldName}-identifier-sources`}
                    defaultSelected={patientIdentifier?.selectedSource?.uuid}
                    onChange={(sourceUuid: string) => handleSelectingIdentifierSource(identifierType, sourceUuid)}
                    orientation="vertical">
                    {identifierType?.identifierSources.map((source) => (
                      <RadioButton
                        key={source.uuid}
                        labelText={source.name}
                        name={source.uuid}
                        value={source.uuid}
                        className={styles.radioButton}
                        disabled={
                          isOffline &&
                          isUniqueIdentifierTypeForOffline(identifierType) &&
                          source.autoGenerationOption?.manualEntryEnabled
                        }
                      />
                    ))}
                  </RadioButtonGroup>
                </div>
              )}
          </div>
        );
      }),
    [
      filteredIdentifiers,
      unsavedIdentifierTypes,
      defaultPatientIdentifierTypesMap,
      identifiers,
      isOffline,
      handleCheckingIdentifier,
      t,
    ],
  );

  const handleConfiguringIdentifiers = useCallback(() => {
    setFieldValue('identifiers', unsavedIdentifierTypes);
    closeOverlay();
  }, [unsavedIdentifierTypes, setFieldValue, closeOverlay]);

  return (
    <Overlay
      close={closeOverlay}
      header={t('configureIdentifiers', 'Configure identifiers')}
      buttonsGroup={
        <ButtonSet className={isDesktop(layout) ? styles.desktop : styles.tablet}>
          <Button className={styles.button} kind="secondary" onClick={closeOverlay}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button className={styles.button} kind="primary" onClick={handleConfiguringIdentifiers}>
            {t('configureIdentifiers', 'Configure identifiers')}
          </Button>
        </ButtonSet>
      }>
      <div>
        <p className={styles.bodyLong02}>
          {t('IDInstructions', "Select the identifiers you'd like to add for this patient:")}
        </p>
        {identifierTypes.length > 7 && (
          <div className={styles.space05}>
            <Search
              labelText={t('searchIdentifierPlaceholder', 'Search identifier')}
              placeholder={t('searchIdentifierPlaceholder', 'Search identifier')}
              onChange={handleSearch}
              value={searchString}
            />
          </div>
        )}
        <fieldset>{identifierTypeFields}</fieldset>
      </div>
    </Overlay>
  );
};

export default PatientIdentifierOverlay;
