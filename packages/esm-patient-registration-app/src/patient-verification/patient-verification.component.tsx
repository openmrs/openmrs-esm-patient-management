import React, { Dispatch, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, ComboBox, Layer, Button, Search } from '@carbon/react';
import styles from './patient-verification.scss';
import { countries, verificationIdentifierTypes } from './assets/verification-assets';
import { searchClientRegistry } from './patient-verification-hook';
import { showToast } from '@openmrs/esm-framework';
import { handleClientRegistryResponse } from './patient-verification-utils';
import { FormValues } from '../patient-registration/patient-registration-types';
import { FormikProps } from 'formik';

interface PatientVerificationProps {
  props: FormikProps<FormValues>;
}

const PatientVerification: React.FC<PatientVerificationProps> = ({ props }) => {
  const { t } = useTranslation();
  const [verificationCriteria, setVerificationCriteria] = useState({
    searchTerm: '',
    identifierType: '',
  });

  const handleSearch = async () => {
    try {
      const clientRegistryResponse = await searchClientRegistry(
        verificationCriteria.identifierType,
        verificationCriteria.searchTerm,
      );
      handleClientRegistryResponse(clientRegistryResponse, props);
    } catch (error) {
      showToast({
        title: 'Client registry error',
        description: `${error}`,
        millis: 10000,
        kind: 'error',
        critical: true,
      });
    }
  };

  return (
    <div id={'patientVerification'}>
      <h3 className={styles.productiveHeading02} style={{ color: '#161616' }}>
        {t('clientVerificationWithClientRegistry', 'Client verification with client registry')}
      </h3>
      <div style={{ margin: '1rem 0 1rem' }}>
        <Tile className={styles.verificationWrapper}>
          <Layer>
            <ComboBox
              ariaLabel={t('selectCountry', 'Select country')}
              id="selectCountry"
              items={countries}
              itemToString={(item) => item?.name ?? ''}
              label="Combo box menu options"
              titleText={t('selectCountry', 'Select country')}
              initialSelectedItem={countries[0]}
            />
          </Layer>
          <Layer>
            <ComboBox
              ariaLabel={t('selectIdentifierType', 'Select identifier type')}
              id="selectIdentifierType"
              items={verificationIdentifierTypes}
              itemToString={(item) => item?.name ?? ''}
              label="Combo box menu options"
              titleText={t('selectIdentifierType', 'Select identifier type')}
              onChange={({ selectedItem }) =>
                setVerificationCriteria({ ...verificationCriteria, identifierType: selectedItem.value })
              }
            />
          </Layer>
          <Layer>
            <Search
              id="search-1"
              placeHolderText="Search"
              disabled={!verificationCriteria.identifierType}
              onChange={(event) => setVerificationCriteria({ ...verificationCriteria, searchTerm: event.target.value })}
            />
          </Layer>

          <Button disabled={!verificationCriteria.identifierType} size="md" onClick={handleSearch}>
            {t('validate', 'Validate')}
          </Button>
        </Tile>
      </div>
    </div>
  );
};

export default PatientVerification;
