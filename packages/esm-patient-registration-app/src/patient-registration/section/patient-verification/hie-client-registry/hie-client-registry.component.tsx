import React, { type Dispatch, type SetStateAction, useState } from 'react';
import styles from './hie-client-registry.scss';
import { Tile, TextInput, ComboBox, Button, Layer, InlineLoading } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import {
  type HiePayload,
  handleSearchError,
  handleSearchSuccess,
  searchHieClientRegistry,
  useIdenfierTypes,
} from './hie-client-registry.resource';
import { type FormValues } from '../../../patient-registration.types';
import { useConfig } from '@openmrs/esm-framework';
import { type RegistrationConfig } from '../../../../config-schema';

type HIEClientRegistryProps = {
  updateRegistrationInitialValues: Dispatch<SetStateAction<FormValues>>;
};

const HIEClientRegistry: React.FC<HIEClientRegistryProps> = ({ updateRegistrationInitialValues }) => {
  const { t } = useTranslation();
  const { patientIdentifierTypes } = useIdenfierTypes();
  const {
    clientRegistry: { url, identificationTypes },
  } = useConfig<RegistrationConfig>();

  const [hiePayload, setHiePayload] = useState<HiePayload>();
  const [isSearching, setIsSearching] = useState(false);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHiePayload((prev) => ({ ...prev, [event.target.id]: event.target.value }));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const fhirPatient = await searchHieClientRegistry(hiePayload, url ?? '');
      handleSearchSuccess(fhirPatient, updateRegistrationInitialValues, t);
    } catch (error) {
      handleSearchError(error, t);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <h3 className={styles.productiveHeading02} style={{ color: '#161616' }}>
        {t('hieClientRegistryTitle', 'HIE Client Registry')}
      </h3>
      <span className={styles.label01}>
        {t('allFieldsRequiredText', 'All fields are required unless marked optional')}
      </span>
      <div style={{ margin: '1rem 0 1rem' }}>
        <Tile className={styles.tileContainer}>
          <Layer>
            <TextInput
              onChange={handleOnChange}
              id="firstName"
              type="text"
              labelText={t('firstName', 'First Name')}
              placeholder={t('firstNamePlaceholder', 'Enter first name')}
            />
          </Layer>
          <Layer>
            <TextInput
              onChange={handleOnChange}
              id="identificationNumber"
              type="text"
              labelText={t('identificationNumber', 'Identification Number')}
              placeholder={t('identificationNumberPlaceholder', 'Enter identification number')}
            />
          </Layer>
          <Layer>
            <ComboBox
              onChange={({ selectedItem }) => setHiePayload((prev) => ({ ...prev, identificationType: selectedItem }))}
              id="identificationType"
              items={identificationTypes ?? []}
              itemToString={(item) => (item ? item.display : '')}
              titleText={t('identificationType', 'Identification Type')}
            />
          </Layer>
          {isSearching ? (
            <InlineLoading description={t('loading', 'Loading...')} />
          ) : (
            <Button
              disabled={!(Object.values(hiePayload ?? {}).length === 3)}
              onClick={() => {
                setIsSearching(true);
                handleSearch();
              }}
              renderIcon={Search}
              size="md"
              kind="tertiary">
              {t('search', 'Search')}
            </Button>
          )}
        </Tile>
      </div>
    </div>
  );
};

export default HIEClientRegistry;
