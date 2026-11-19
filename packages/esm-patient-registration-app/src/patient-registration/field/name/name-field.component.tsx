import React, { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, SkeletonText, Switch } from '@carbon/react';
import { useField } from 'formik';
import { ExtensionSlot, useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../../../config-schema';
import { usePatientRegistrationContext } from '../../patient-registration-context';
import { Input } from '../../input/basic-input/input/input.component';
import { type NameProperty, type NameTemplate } from '../../patient-registration.types';
import { useNameTemplate } from './name-template.resource';
import { alwaysRequiredNameFields, getNameTemplateFieldNames } from './name-template';
import styles from '../field.scss';

export const unidentifiedPatientAttributeTypeUuid = '8b56eac7-5c76-4b9c-8c6f-1deab8d3fc47';
const containsNoNumbers = /^([^0-9]*)$/;

function checkNumber(value: string) {
  if (!containsNoNumbers.test(value)) {
    return 'numberInNameDubious';
  }

  return undefined;
}

interface NameFieldLayout {
  name: NameProperty;
  label: string;
  required: boolean;
}

/** Reads the name fields, in order, from a name template, with the labels it gives them. */
export function getNameTemplateLayout(
  nameTemplate: NameTemplate,
  getDefaultLabel: (name: NameProperty) => string,
): Array<NameFieldLayout> {
  const requiredElements = new Set([...alwaysRequiredNameFields, ...(nameTemplate.requiredElements ?? [])]);
  const labels: Record<string, string> = {};
  nameTemplate.lines
    ?.flat()
    .filter(({ isToken, displayText }) => isToken === 'IS_NAME_TOKEN' && displayText)
    .forEach(({ codeName, displayText }) => {
      labels[codeName] ??= displayText;
    });

  return getNameTemplateFieldNames(nameTemplate).map((name) => ({
    name,
    label: labels[name] || getDefaultLabel(name),
    required: requiredElements.has(name),
  }));
}

export const NameField = () => {
  const { t } = useTranslation();
  const { setCapturePhotoProps, currentPhoto, setFieldValue, setFieldTouched } = usePatientRegistrationContext();

  const {
    fieldConfigurations: {
      name: {
        displayCapturePhoto,
        allowUnidentifiedPatients,
        defaultUnknownGivenName,
        defaultUnknownFamilyName,
        displayMiddleName,
        displayReverseFieldOrder,
        nameTemplate: nameTemplateCodeName,
      },
    },
  } = useConfig<RegistrationConfig>();
  const {
    nameTemplate,
    error: nameTemplateError,
    isLoading: isLoadingNameTemplate,
  } = useNameTemplate(nameTemplateCodeName);

  const [{ value: isPatientUnknownValue }, , { setValue: setUnknownPatient }] = useField<string>(
    `attributes.${unidentifiedPatientAttributeTypeUuid}`,
  );

  const isPatientUnknown = isPatientUnknownValue === 'true';

  const onCapturePhoto = useCallback(
    (dataUri: string, photoDateTime: string) => {
      if (setCapturePhotoProps) {
        setCapturePhotoProps({
          imageData: dataUri,
          dateTime: photoDateTime,
        });
        setFieldTouched('photo', true, false);
      }
    },
    [setCapturePhotoProps, setFieldTouched],
  );

  const getDefaultLabel = useCallback(
    (name: NameProperty) =>
      ({
        prefix: t('prefixLabelText', 'Prefix'),
        givenName: t('givenNameLabelText', 'First Name'),
        middleName: t('middleNameLabelText', 'Middle Name'),
        familyNamePrefix: t('familyNamePrefixLabelText', 'Family Name Prefix'),
        familyName: t('familyNameLabelText', 'Family Name'),
        familyName2: t('familyName2LabelText', 'Second Family Name'),
        familyNameSuffix: t('familyNameSuffixLabelText', 'Family Name Suffix'),
        degree: t('degreeLabelText', 'Degree'),
      })[name],
    [t],
  );

  // Without a name template, or when it cannot be loaded, the form shows the default name fields
  const nameFields = useMemo<Array<NameFieldLayout>>(() => {
    if (nameTemplate?.lines) {
      return getNameTemplateLayout(nameTemplate, getDefaultLabel);
    }

    const defaultFields: Array<NameFieldLayout> = [
      { name: 'givenName', label: getDefaultLabel('givenName'), required: true },
      ...(displayMiddleName
        ? [{ name: 'middleName' as const, label: getDefaultLabel('middleName'), required: false }]
        : []),
      { name: 'familyName', label: getDefaultLabel('familyName'), required: true },
    ];
    return displayReverseFieldOrder ? defaultFields.reverse() : defaultFields;
  }, [nameTemplate, getDefaultLabel, displayMiddleName, displayReverseFieldOrder]);

  useEffect(() => {
    if (nameTemplateCodeName && nameTemplateError) {
      console.error(
        `The name template '${nameTemplateCodeName}' could not be loaded, so the default name fields are shown.`,
        nameTemplateError,
      );
    }
  }, [nameTemplateCodeName, nameTemplateError]);

  const toggleNameKnown = (e) => {
    nameFields.forEach(({ name }) => setFieldValue(name, ''));
    if (e.name === 'known') {
      setUnknownPatient('false');
    } else {
      setFieldValue('givenName', defaultUnknownGivenName);
      setFieldValue('familyName', defaultUnknownFamilyName);
      setUnknownPatient('true');
    }
    nameFields.forEach(({ name }) => setFieldTouched(name, true));
    setFieldTouched(`attributes.${unidentifiedPatientAttributeTypeUuid}`, true, false);
  };

  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('fullNameLabelText', 'Full Name')}</h4>
      <div className={styles.grid}>
        {displayCapturePhoto && (
          <ExtensionSlot
            className={styles.photoExtension}
            name="capture-patient-photo-slot"
            state={{ onCapturePhoto, initialState: currentPhoto }}
          />
        )}

        <div className={styles.nameField}>
          {nameTemplateCodeName && isLoadingNameTemplate ? (
            // The whole name area waits for the template, so the patient cannot be marked unknown before its fields
            // and defaults are known
            <div role="progressbar" aria-label={t('loading', 'Loading')}>
              <SkeletonText />
            </div>
          ) : (
            <>
              {(allowUnidentifiedPatients || isPatientUnknown) && (
                <>
                  <div className={styles.dobContentSwitcherLabel}>
                    <span className={styles.label01}>{t('patientNameKnown', "Patient's Name is Known?")}</span>
                  </div>
                  <ContentSwitcher
                    className={styles.contentSwitcher}
                    size="md"
                    selectedIndex={isPatientUnknown ? 1 : 0}
                    onChange={toggleNameKnown}>
                    <Switch name="known">{t('yes', 'Yes')}</Switch>
                    <Switch name="unknown">{t('no', 'No')}</Switch>
                  </ContentSwitcher>
                </>
              )}
              {!isPatientUnknown &&
                nameFields.map(({ name, label, required }) => (
                  <Input
                    key={name}
                    id={name}
                    name={name}
                    labelText={label}
                    checkWarning={checkNumber}
                    required={required}
                    validate={
                      // The validation schema checks the always-required names; other required parts are checked here
                      required && !alwaysRequiredNameFields.includes(name)
                        ? (value) => (value ? undefined : t('nameFieldRequired', '{{label}} is required', { label }))
                        : undefined
                    }
                  />
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
