import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { UserFollow } from '@carbon/react/icons';
import { Button, Layer, Search, Tile } from '@carbon/react';
import SearchIllustration from './search-illustration.component';
import SearchResults from './search-results.component';
import { findPatients } from './search.resource';
import { SearchTypes } from '../types';
import { navigate } from '@openmrs/esm-framework';
import styles from './basic-search.scss';

interface BasicSearchProps {
  toggleSearchType: (searchMode: SearchTypes, patient: fhir.Patient) => void;
  patient: fhir.Patient;
}

const BasicSearch: React.FC<BasicSearchProps> = ({ toggleSearchType, patient }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const searchTimeoutInMs = 300;
  const customRepresentation =
    'custom:(patientId,uuid,identifiers,display,' +
    'patientIdentifier:(uuid,identifier),' +
    'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
    'attributes:(value,attributeType:(name)))';

  const handleSearch = useMemo(() => debounce((searchTerm) => setSearchTerm(searchTerm), searchTimeoutInMs), []);

  useEffect(() => {
    if (searchTerm?.length) {
      const controller = new AbortController();
      findPatients(searchTerm, customRepresentation, controller, false)
        .then(({ data }) => {
          const results = data.results.map((res, i) => ({
            ...res,
            index: i + 1,
          }));
          setSearchResults(results);
        })
        .finally(() => {
          controller.abort();
        });
    }
  }, [customRepresentation, searchTerm]);

  return (
    <div className={searchResults?.length ? styles.lightBackground : styles.resultsContainer}>
      <div className={styles.searchboxContainer}>
        <Layer>
          <Search
            autoFocus
            className={styles.searchInput}
            labelText="Search for a patient"
            placeholder={t('searchboxPlaceholder', 'Search for a patient name or ID number')}
            onChange={(event) => handleSearch(event.target.value)}
            onClear={() => setSearchResults([])}
          />
        </Layer>
        <Button iconDescription="Basic search" size="md" kind="secondary">
          {t('search', 'Search')}
        </Button>
      </div>
      {searchResults?.length > 0 ? (
        <div className={styles.resultsContainer}>
          {<SearchResults toggleSearchType={toggleSearchType} patients={searchResults} />}
        </div>
      ) : searchTerm && searchResults?.length === 0 ? (
        <div className={styles.addPatientTileContainer}>
          <Tile className={styles.addPatientTile}>
            <div className={styles.addPatientTileContent}>
              <p className={styles.content}>{t('patientNotFound', 'No patient found')}</p>
              <p className={styles.helper}>{t('checkSearch', 'Check the search term')}</p>
            </div>
            <p className={styles.addPatientSeparator}>{t('or', 'or')}</p>
            <Button
              kind="ghost"
              size="small"
              renderIcon={UserFollow}
              onClick={() => navigate({ to: '${openmrsSpaBase}/patient-registration' })}>
              {t('addPatient', 'Add patient')}
            </Button>
          </Tile>
        </div>
      ) : (
        <div>
          <div className={styles.tileContainer}>
            <Layer>
              <Tile className={styles.tile}>
                <SearchIllustration />
                <div className={styles.helperText}>
                  <p className={styles.primaryText}>{t('primaryHelperText', 'Search for a patient')}</p>
                  <p className={styles.secondaryText}>
                    {t('secondaryHelperText', "Type the patient's name or unique ID number")}
                  </p>
                </div>
              </Tile>
            </Layer>
          </div>
          <p className={styles.separator}>{t('or', 'or')}</p>
          <div className={styles.buttonContainer}>
            <Button
              kind="ghost"
              iconDescription="Advanced search"
              renderIcon={Search}
              onClick={() => toggleSearchType(SearchTypes.ADVANCED, patient)}>
              {t('advancedSearch', 'Advanced search')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicSearch;
