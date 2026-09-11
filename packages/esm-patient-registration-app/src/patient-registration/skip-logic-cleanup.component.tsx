import { useEffect } from 'react';
import { type RegistrationConfig } from '../config-schema';
import { type FormValues } from './patient-registration.types';
import { getAgeInYears, getHiddenFieldIds } from './patient-registration-utils';

export interface SkipLogicCleanupProps {
  values: FormValues;
  config: RegistrationConfig;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  setFieldError?: (field: string, message: string | undefined) => void;
  setFieldTouched?: (field: string, isTouched?: boolean, shouldValidate?: boolean) => void;
}

export const SkipLogicCleanup = ({ values, config, setFieldValue, setFieldError, setFieldTouched }) => {
  useEffect(() => {
    if (!config) {
      return;
    }

    const ageInYears = getAgeInYears(values);
    const hiddenFieldIds = getHiddenFieldIds(values, config, ageInYears);

    hiddenFieldIds.forEach((fieldId) => {
      const fieldDef = config.fieldDefinitions?.find((f) => f.id === fieldId);
      if (fieldDef) {
        if (fieldDef.type === 'person attribute') {
          const val = values.attributes?.[fieldDef.uuid];
          if (val !== undefined && val !== '') {
            setFieldValue(`attributes.${fieldDef.uuid}`, '');
            setFieldError?.(`attributes.${fieldDef.uuid}`, undefined);
            setFieldTouched?.(`attributes.${fieldDef.uuid}`, false);
          }
        } else if (fieldDef.type === 'obs') {
          const val = values.obs?.[fieldDef.uuid];
          if (val !== undefined && val !== '') {
            setFieldValue(`obs.${fieldDef.uuid}`, '');
            setFieldError?.(`obs.${fieldDef.uuid}`, undefined);
            setFieldTouched?.(`obs.${fieldDef.uuid}`, false);
          }
        }
      } else {
        if (fieldId === 'phone') {
          const phoneUuid = config.fieldConfigurations?.phone?.personAttributeUuid;
          if (phoneUuid && values.attributes?.[phoneUuid]) {
            setFieldValue(`attributes.${phoneUuid}`, '');
            setFieldError?.(`attributes.${phoneUuid}`, undefined);
            setFieldTouched?.(`attributes.${phoneUuid}`, false);
          }
        } else if (fieldId === 'causeOfDeath') {
          if (values.deathCause || values.nonCodedCauseOfDeath) {
            setFieldValue('deathCause', '');
            setFieldValue('nonCodedCauseOfDeath', '');
            setFieldError?.('deathCause', undefined);
            setFieldError?.('nonCodedCauseOfDeath', undefined);
          }
        } else if (fieldId === 'dateAndTimeOfDeath') {
          if (values.deathDate || values.deathTime) {
            setFieldValue('deathDate', '');
            setFieldValue('deathTime', '');
            setFieldError?.('deathDate', undefined);
            setFieldError?.('deathTime', undefined);
          }
        }
      }
    });
  }, [values, config, setFieldValue, setFieldError, setFieldTouched]);

  return null;
};
