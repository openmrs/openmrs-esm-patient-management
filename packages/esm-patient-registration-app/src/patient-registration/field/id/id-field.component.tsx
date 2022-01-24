import React, { useContext, useEffect, useState } from 'react';
import { IdentifierInput } from '../../input/custom-input/identifier/identifier-input.component';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Button } from 'carbon-components-react';
import { ArrowRight16 } from '@carbon/icons-react';
import { useLayoutType } from '@openmrs/esm-framework';
import { PatientIdentifierValue } from '../../patient-registration-types';
import IdentifierSelectionOverlay from '../../ui-components/identifier-selection-overlay';
import { FieldArray, useField } from 'formik';
import { ResourcesContext } from '../../../offline.resources';

export const IdField: React.FC = () => {
  const { patientIdentifiers: identifierTypes } = useContext(ResourcesContext);
  const { setFieldValue, inEditMode } = useContext(PatientRegistrationContext);
  const { t } = useTranslation();
  const desktop = useLayoutType() === 'desktop';
  const [showIdentifierOverlay, setIdentifierOverlay] = useState<boolean>(false);

  useEffect(() => {
    if (!inEditMode) {
      setFieldValue(
        'identifiers',
        identifierTypes
          .filter((identifierType) => identifierType.isPrimary || identifierType.required)
          .map(
            (identifierType) =>
              ({
                action: 'ADD',
                identifier: '',
                identifierType: identifierType.uuid,
                source: identifierType.identifierSources.length > 0 ? identifierType.identifierSources[0] : null,
              } as PatientIdentifierValue),
          ),
      );
    }
  }, [identifierTypes, inEditMode]);

  return (
    <div className={styles.halfWidthInDesktopView}>
      <div className={styles.identifierLabelText}>
        <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
        <Button
          kind="ghost"
          className={styles.setIDNumberButton}
          onClick={() => setIdentifierOverlay(true)}
          size={desktop ? 'sm' : 'md'}>
          {t('configure', 'Configure')} <ArrowRight16 />
        </Button>
      </div>
      <div>
        <FieldArray name="identifiers">
          {({
            push,
            remove,
            form: {
              values: { identifiers },
            },
          }) => (
            <>
              {identifiers.map((identifier: PatientIdentifierValue, index) => (
                <IdentifierInput key={index} index={index} patientIdentifier={identifier} remove={remove} />
              ))}
              {showIdentifierOverlay && (
                <IdentifierSelectionOverlay
                  setFieldValue={setFieldValue}
                  closeOverlay={() => setIdentifierOverlay(false)}
                  push={push}
                  identifiers={identifiers}
                  remove={remove}
                />
              )}
            </>
          )}
        </FieldArray>
      </div>
    </div>
  );
};
