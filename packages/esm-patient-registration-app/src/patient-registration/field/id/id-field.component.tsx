import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SkeletonText } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';
import { useLayoutType, useConfig, isDesktop, UserHasAccess } from '@openmrs/esm-framework';
import IdentifierInput from '../../input/custom-input/identifier/identifier-input.component';
import IdentifierSelectionOverlay from './identifier-selection-overlay.component';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { ResourcesContext } from '../../../offline.resources';
import { initializeIdentifier } from './identifier-utils';
import styles from '../field.scss';

export const Identifiers: React.FC = () => {
  const { identifierTypes } = useContext(ResourcesContext);
  const isLoading = !identifierTypes;
  const { values, setFieldValue, initialFormValues, isOffline } = useContext(PatientRegistrationContext);
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [showIdentifierOverlay, setShowIdentifierOverlay] = useState(false);
  const config = useConfig();
  const { defaultPatientIdentifierTypes } = config;

  useEffect(() => {
    // Initialization
    if (identifierTypes) {
      const identifiers = {};
      identifierTypes
        .filter(
          (type) =>
            type.isPrimary ||
            type.required ||
            !!defaultPatientIdentifierTypes?.find(
              (defaultIdentifierTypeUuid) => defaultIdentifierTypeUuid === type.uuid,
            ),
        )
        .filter((type) => !values.identifiers[type.fieldName])
        .forEach((type) => {
          identifiers[type.fieldName] = initializeIdentifier(
            type,
            values.identifiers[type.uuid] ?? initialFormValues.identifiers[type.uuid] ?? {},
          );
        });
      /*
        Identifier value should only be updated if there is any update in the
        identifier values, otherwise, if the below 'if' clause is removed, it will
        fall into an infinite run.
      */
      if (Object.keys(identifiers).length) {
        setFieldValue('identifiers', {
          ...values.identifiers,
          ...identifiers,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identifierTypes, setFieldValue, defaultPatientIdentifierTypes, values.identifiers, initializeIdentifier]);

  const closeIdentifierSelectionOverlay = useCallback(
    () => setShowIdentifierOverlay(false),
    [setShowIdentifierOverlay],
  );

  if (isLoading && !isOffline) {
    return (
      <div data-testid="loading-skeleton" className={styles.halfWidthInDesktopView}>
        <div className={styles.identifierLabelText}>
          <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
        </div>
        <SkeletonText />
      </div>
    );
  }

  return (
    <div className={styles.halfWidthInDesktopView}>
      <UserHasAccess privilege={['Get Identifier Types', 'Add Patient Identifiers']}>
        <div className={styles.identifierLabelText}>
          <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
          <Button
            kind="ghost"
            className={styles.setIDNumberButton}
            onClick={() => setShowIdentifierOverlay(true)}
            size={isDesktop(layout) ? 'sm' : 'md'}>
            {t('configure', 'Configure')} <ArrowRight size={16} />
          </Button>
        </div>
      </UserHasAccess>
      <div>
        {Object.entries(values.identifiers).map(([fieldName, identifier]) => (
          <IdentifierInput key={fieldName} fieldName={fieldName} patientIdentifier={identifier} />
        ))}
        {showIdentifierOverlay && (
          <IdentifierSelectionOverlay setFieldValue={setFieldValue} closeOverlay={closeIdentifierSelectionOverlay} />
        )}
      </div>
    </div>
  );
};
