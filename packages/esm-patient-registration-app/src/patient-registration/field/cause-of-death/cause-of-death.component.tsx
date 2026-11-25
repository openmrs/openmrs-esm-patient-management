import React, { useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { InlineNotification, Layer, Select, SelectItem, SelectSkeleton, TextInput } from '@carbon/react';
import { useConfig } from '@openmrs/esm-framework';
import { useRegistrationField } from '../../form-adapter';
import { useConceptAnswers } from '../field.resource';
import type { RegistrationConfig } from '../../../config-schema';
import styles from '../field.scss';

export const CauseOfDeathField: React.FC = () => {
  const { t } = useTranslation();
  const { fieldConfigurations, freeTextFieldConceptUuid } = useConfig<RegistrationConfig>();
  const {
    field: deathCauseField,
    error: deathCauseError,
    touched: deathCauseTouched,
  } = useRegistrationField<string>('deathCause');
  const {
    field: nonCodedCauseOfDeathField,
    error: nonCodedCauseOfDeathError,
    touched: nonCodedCauseOfDeathTouched,
  } = useRegistrationField<string>('nonCodedCauseOfDeath');

  const conceptUuid = fieldConfigurations?.causeOfDeath?.conceptUuid;
  const required = fieldConfigurations?.causeOfDeath?.required;

  const {
    data: conceptAnswers,
    isLoading: isLoadingConceptAnswers,
    error: errorLoadingConceptAnswers,
  } = useConceptAnswers(conceptUuid);

  const answers = useMemo(() => {
    if (!isLoadingConceptAnswers && conceptAnswers) {
      return conceptAnswers.map((answer) => ({ ...answer, label: answer.display }));
    }
    return [];
  }, [conceptAnswers, isLoadingConceptAnswers]);

  if (isLoadingConceptAnswers) {
    return (
      <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
        <h4 className={styles.productiveHeading02Light}>{t('causeOfDeathInputLabel', 'Cause of death')}</h4>
        <SelectSkeleton />
      </div>
    );
  }

  return (
    <div className={classNames(styles.customField, styles.halfWidthInDesktopView)}>
      <h4 className={styles.productiveHeading02Light}>{t('causeOfDeathInputLabel', 'Cause of death')}</h4>
      {errorLoadingConceptAnswers || !conceptUuid ? (
        <InlineNotification
          hideCloseButton
          kind="error"
          title={t('errorFetchingCodedCausesOfDeath', 'Error fetching coded causes of death')}
          subtitle={t('refreshOrContactAdmin', 'Try refreshing the page or contact your system administrator')}
        />
      ) : (
        <>
          <Layer>
            <Select
              {...deathCauseField}
              id="deathCause"
              invalid={!!(deathCauseError && deathCauseTouched)}
              // Kept as before: no message shows here, because the Formik code read `.message` of a string error.
              invalidText={undefined}
              labelText={t('causeOfDeathInputLabel', 'Cause of death')}
              name="deathCause"
              required={required}>
              <SelectItem id="empty-default-option" value={null} text={t('selectAnOption', 'Select an option')} />
              {answers.map((answer) => (
                <SelectItem id={answer.uuid} key={answer.uuid} text={answer.label} value={answer.uuid} />
              ))}
            </Select>
          </Layer>
          {deathCauseField.value === freeTextFieldConceptUuid && (
            <div className={styles.nonCodedCauseOfDeath}>
              <Layer>
                <TextInput
                  {...nonCodedCauseOfDeathField}
                  id="nonCodedCauseOfDeath"
                  invalid={!!(nonCodedCauseOfDeathError && nonCodedCauseOfDeathTouched)}
                  // Kept as before: no message shows here, because the Formik code read `.message` of a string error.
                  invalidText={undefined}
                  labelText={t('nonCodedCauseOfDeath', 'Non-coded cause of death')}
                  placeholder={t('enterNonCodedCauseOfDeath', 'Enter non-coded cause of death')}
                />
              </Layer>
            </div>
          )}
        </>
      )}
    </div>
  );
};
