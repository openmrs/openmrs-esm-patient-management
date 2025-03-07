import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, SkeletonText, Switch } from '@carbon/react';
import { useField } from 'formik';
import { useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../../../config-schema';
import { Input } from '../../input/basic-input/input/input.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { ResourcesContext } from '../../../offline.resources';
import { PhotoComponent } from '../photo/photo-field.component';
import { type NameProperties, type NameTemplate } from '../../patient-registration.types';
import styles from '../field.scss';

export const unidentifiedPatientAttributeTypeUuid = '8b56eac7-5c76-4b9c-8c6f-1deab8d3fc47';

/**
 * DO NOT REMOVE THIS COMMENT HERE, ADDS TRANSLATION FOR NAME FIELD ELEMENTS
 * t('nameLabelText.prefix', 'Prefix')
 * t('nameLabelText.givenName', 'First Name')
 * t('nameLabelText.middleName', 'Middle Name')
 * t('nameLabelText.familyNamePrefix', 'Family Name Prefix')
 * t('nameLabelText.familyName', 'Family Name')
 * t('nameLabelText.familyName2', 'Family Name 2')
 * t('nameLabelText.familyNameSuffix', 'Family Name Suffix')
 * t('nameLabelText.degree', 'Degree')
 */

const containsNoNumbers = /^([^0-9]*)$/;

function checkNoNumbers(value: string) {
  if (!containsNoNumbers.test(value)) {
    return 'numberInNameDubious';
  }
  return undefined;
}

function getLayoutFields(nameTemplate: NameTemplate, reverseFieldOrder: Boolean = false) {
  const allFields = nameTemplate?.lines?.flat();
  const fields = allFields?.filter(({ isToken }) => isToken === 'IS_NAME_TOKEN');
  return !reverseFieldOrder ? fields : fields.reverse();
}

function getRequiredFields(nameTemplate: NameTemplate, ...required: NameProperties[]) {
  const requiredFields = required.map((curr) => [curr, curr]);
  const nameTemplateRequiredFields = nameTemplate?.requiredElements?.map((curr) => [curr, curr]) || [];
  return Object.fromEntries(requiredFields.concat(nameTemplateRequiredFields));
}

const defaultNameLayout: { id: NameProperties; name: NameProperties; label: string; required: boolean }[] = [
  { id: 'givenName', name: 'givenName', label: 'First Name', required: true },
  { id: 'middleName', name: 'middleName', label: 'Middle Name', required: false },
  { id: 'familyName', name: 'familyName', label: 'Family Name', required: true },
];

export const NameFieldWithTemplate: React.FC = () => {
  const { t } = useTranslation();
  const { setFieldValue, setFieldTouched } = useContext(PatientRegistrationContext);
  const {
    fieldConfigurations: {
      name: {
        displayCapturePhoto,
        allowUnidentifiedPatients,
        defaultUnknownGivenName,
        defaultUnknownFamilyName,
        displayReverseFieldOrder,
      },
    },
  } = useConfig<RegistrationConfig>();

  const { nameTemplate } = useContext(ResourcesContext);
  const nameLayout = useMemo(() => {
    if (!nameTemplate?.lines) {
      return defaultNameLayout;
    }

    const fields = getLayoutFields(nameTemplate, displayReverseFieldOrder);
    // givenName and familyName fields are always required for the patient API, irrespective of the name template.
    // ...see also patient-registration-validation.ts
    const requiredFields = getRequiredFields(nameTemplate, 'givenName', 'familyName');
    return fields.map(({ displayText, codeName }) => {
      return {
        id: codeName,
        name: codeName,
        label: displayText,
        required: Boolean(requiredFields[codeName]),
      };
    });
  }, [nameTemplate, displayReverseFieldOrder]);

  const clearNameFieldValues = () => {
    nameLayout?.forEach((value) => {
      setFieldValue(value.name, '');
    });
  };

  const setDefaultNameFieldValues = useCallback(() => {
    if (nameTemplate?.elementDefaults) {
      Object.entries(nameTemplate.elementDefaults).forEach(([name, defaultValue]) => {
        setFieldValue(name, defaultValue);
      });
    }
  }, [nameTemplate, setFieldValue]);

  const setUnknownNameFieldValues = () => {
    setFieldValue('givenName', defaultUnknownGivenName);
    setFieldValue('familyName', defaultUnknownFamilyName);
  };

  const touchNameFields = () => {
    nameLayout?.forEach((value) => {
      setFieldTouched(value.name, true);
    });
  };

  useEffect(() => {
    setDefaultNameFieldValues();
  }, [setDefaultNameFieldValues]);

  const [{ value: isPatientUnknownValue }, , { setValue: setUnknownPatient }] = useField<string>(
    `attributes.${unidentifiedPatientAttributeTypeUuid}`,
  );

  const isPatientUnknown = isPatientUnknownValue === 'true';

  const toggleNameKnown = (e) => {
    clearNameFieldValues();
    setDefaultNameFieldValues();
    if (e.name === 'known') {
      setUnknownPatient('false');
    } else {
      setUnknownNameFieldValues();
      setUnknownPatient('true');
    }
    touchNameFields();
    setFieldTouched(`attributes.${unidentifiedPatientAttributeTypeUuid}`, true, false);
  };

  if (nameTemplate && !Object.keys(nameTemplate)?.length) {
    return (
      <NameComponentContainer>
        <SkeletonText role="progressbar" />
      </NameComponentContainer>
    );
  }

  return (
    <NameComponentContainer>
      {displayCapturePhoto && <PhotoComponent></PhotoComponent>}

      <div className={styles.nameField}>
        {(allowUnidentifiedPatients || isPatientUnknown) && (
          <>
            <div className={styles.dobContentSwitcherLabel}>
              <span className={styles.label01}>{t('patientNameKnown', "Patient's Name is Known?")}</span>
            </div>
            <ContentSwitcher
              className={styles.contentSwitcher}
              selectedIndex={isPatientUnknown ? 1 : 0}
              onChange={toggleNameKnown}>
              <Switch name="known" text={t('yes', 'Yes')} />
              <Switch name="unknown" text={t('no', 'No')} />
            </ContentSwitcher>
          </>
        )}
        {!isPatientUnknown ? (
          <>
            {nameLayout.map((attributes, index) => (
              <Input
                key={`text_input_${index}`}
                name={attributes.name}
                labelText={t(`nameLabelText.${attributes.name}`, attributes.label)}
                id={`name.${attributes.name}`}
                checkWarning={checkNoNumbers}
                required={attributes.required}
              />
            ))}
          </>
        ) : (
          <></>
        )}
      </div>
    </NameComponentContainer>
  );
};

const NameComponentContainer = ({ children }) => {
  const { t } = useTranslation();
  return (
    <div>
      <h4 className={styles.productiveHeading02Light}>{t('fullNameLabelText', 'Full Name')}</h4>
      <div className={styles.grid}>{children}</div>
    </div>
  );
};
