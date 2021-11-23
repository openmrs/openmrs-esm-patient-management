import React, { useContext } from 'react';
import { IdentifierInput } from '../../input/custom-input/identifier/identifier-input.component';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Button } from 'carbon-components-react';
import { ArrowRight16 } from '@carbon/icons-react';

export const IdField: React.FC = () => {
  const { identifierTypes, showPatientIdentifierOverlay } = useContext(PatientRegistrationContext);
  const { t } = useTranslation();

  return (
    <div>
      <div className={styles.identifierLabelText}>
        <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
        <Button kind="ghost" className={styles.setIDNumberButton} onClick={showPatientIdentifierOverlay}>
          {t('configure', 'Configure')} <ArrowRight16 />
        </Button>
      </div>
      <div className={styles.grid}>
        {identifierTypes?.map((identifierType) => (
          <IdentifierInput key={identifierType.fieldName} identifierType={identifierType} />
        ))}
      </div>
    </div>
  );
};
