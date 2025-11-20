import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, ComboBox, Layer, Button, Search, InlineLoading, InlineNotification } from '@carbon/react';
import styles from './patient-verification.scss';
import { showSnackbar, showToast } from '@openmrs/esm-framework';
import { type FormikProps } from 'formik';
import { type FormValues } from '../patient-registration/patient-registration.types';
import { useSearchClientRegistry } from './patient-verification-hook';
import { handleClientRegistryResponse } from './patient-verification-utils';
import { type ClientRegistryFhirPatientResponse } from './verification-types';

interface PatientVerificationProps {
  props: FormikProps<FormValues>;
  setInitialFormValues: React.Dispatch<FormValues>;
}

const PatientVerification: React.FC<PatientVerificationProps> = ({ props }) => {
  const { t } = useTranslation();
  // understand how to configure this
  const [verificationCriteria, setVerificationCriteria] = useState({
    searchTerm: '',
  });
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const { data, error } = useSearchClientRegistry(verificationCriteria.searchTerm);

  const handleSearch = async () => {
    setIsLoadingSearch(true);
    try {
      setIsLoadingSearch(false);

      handleClientRegistryResponse(data as ClientRegistryFhirPatientResponse, props, verificationCriteria.searchTerm);
    } catch (error) {
      showSnackbar({
        title: 'Client registry error',
        subtitle: `Please reload the registration page and re-try again, if the issue persist contact system administrator`,
        timeoutInMs: 10000,
        kind: 'error',
        isLowContrast: true,
      });
      setIsLoadingSearch(false);
    }
  };

  return (
    <div id={'patientVerification'}>
      <h3 className={`${styles.productiveHeading02} ${styles.heading}`}>
        {t('clientVerificationWithClientRegistry', 'Client verification with client registry')}
      </h3>
      <div className={styles.verificationContainer}>
        <Tile className={styles.verificationWrapper}>
          <Layer>
            <Search
              id="clientRegistrySearch"
              autoFocus
              placeHolderText={t('searchClientRegistry', 'Search client registry')}
              onChange={(event) => setVerificationCriteria({ ...verificationCriteria, searchTerm: event.target.value })}
            />
          </Layer>
          {!isLoadingSearch ? (
            <Button disabled={!verificationCriteria.searchTerm} size="md" onClick={handleSearch}>
              {t('validate', 'Validate')}
            </Button>
          ) : (
            <InlineLoading status="active" iconDescription="Loading" description="Searching client registry" />
          )}
        </Tile>
      </div>
    </div>
  );
};

export default PatientVerification;
