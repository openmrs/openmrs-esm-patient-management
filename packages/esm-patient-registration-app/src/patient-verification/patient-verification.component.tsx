import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, ComboBox, Layer, Button, Search, InlineLoading, InlineNotification } from '@carbon/react';
import styles from './patient-verification.scss';
import { countries, verificationIdentifierTypes } from './assets/verification-assets';
import { searchClientRegistry, useGlobalProperties } from './patient-verification-hook';
import { showSnackbar, showToast } from '@openmrs/esm-framework';
import { handleClientRegistryResponse } from './patient-verification-utils';
import { type FormikProps } from 'formik';
import { type FormValues } from '../patient-registration/patient-registration.types';

interface PatientVerificationProps {
  props: FormikProps<FormValues>;
  setInitialFormValues: React.Dispatch<FormValues>;
}

const PatientVerification: React.FC<PatientVerificationProps> = ({ props }) => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGlobalProperties();
  const [verificationCriteria, setVerificationCriteria] = useState({
    searchTerm: '',
    identifierType: '',
    countryCode: 'KE',
  });
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  const handleSearch = async () => {
    setIsLoadingSearch(true);
    try {
      const clientRegistryResponse = await searchClientRegistry(
        verificationCriteria.identifierType,
        verificationCriteria.searchTerm,
        props.values.token,
        verificationCriteria.countryCode,
      );
      setIsLoadingSearch(false);

      handleClientRegistryResponse(clientRegistryResponse, props, verificationCriteria.searchTerm);
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
      <h3 className={styles.productiveHeading02} style={{ color: '#161616' }}>
        {t('clientVerificationWithClientRegistry', 'Client verification with client registry')}
      </h3>
      <div style={{ margin: '1rem 0 1rem' }}>
        <Layer>
          {isLoading && <InlineLoading status="active" iconDescription="Loading" description="Loading data..." />}
        </Layer>
        {error && (
          <InlineNotification
            className={styles.errorWrapper}
            aria-label="closes notification"
            kind="error"
            lowContrast
            statusIconDescription="notification"
            subtitle={t(
              'clientRegistryErrorSubtitle',
              'Please proceed with registration contact system admin and  try again later',
            )}
            title={t('clientRegistryError', 'Error occurred while reaching the client registry')}
          />
        )}
        <Tile className={styles.verificationWrapper}>
          <Layer>
            <ComboBox
              ariaLabel={t('selectCountry', 'Select country')}
              id="selectCountry"
              items={countries}
              itemToString={(item) => item?.name ?? ''}
              label="Select country"
              titleText={t('selectCountry', 'Select country')}
              initialSelectedItem={countries[0]}
              onChange={({ selectedItem }) =>
                setVerificationCriteria({ ...verificationCriteria, countryCode: selectedItem?.initials })
              }
            />
          </Layer>
          <Layer>
            <ComboBox
              ariaLabel={t('selectIdentifierType', 'Select identifier type')}
              id="selectIdentifierType"
              items={verificationIdentifierTypes}
              itemToString={(item) => item?.name ?? ''}
              label="Select identifier type"
              titleText={t('selectIdentifierType', 'Select identifier type')}
              onChange={({ selectedItem }) =>
                setVerificationCriteria({ ...verificationCriteria, identifierType: selectedItem?.value })
              }
            />
          </Layer>
          <Layer>
            <Search
              id="clientRegistrySearch"
              autoFocus
              placeHolderText={t('searchClientRegistry', 'Search client registry')}
              disabled={!verificationCriteria.identifierType}
              onChange={(event) => setVerificationCriteria({ ...verificationCriteria, searchTerm: event.target.value })}
            />
          </Layer>
          {!isLoadingSearch ? (
            <Button disabled={!verificationCriteria.identifierType && !isLoading} size="md" onClick={handleSearch}>
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
