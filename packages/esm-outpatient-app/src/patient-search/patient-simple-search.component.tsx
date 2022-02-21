import { Search, Button, Tile } from 'carbon-components-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { SearchMode } from '../types';
import PatientSearchIcon from './patient-search-icon.component';
import styles from './patient-simple-search.component.scss';

interface PatientSimpleSearchProps {
  handleAdvanceSearch: (searchMode: SearchMode) => void;
}

const PatientSimpleSearch: React.FC<PatientSimpleSearchProps> = ({ handleAdvanceSearch }) => {
  const { t } = useTranslation();

  return (
    <div>
      <div className={styles.patientSearchContainer}>
        <Search
          light
          className={styles.patientSearchInput}
          placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
          labelText=""
          autoFocus={true}
        />
        <Button className={styles.searchButton}>{t('search', 'Search')}</Button>
      </div>

      <div className={styles.searchTextContainer}>
        <Tile light className={styles.tile}>
          <div className={styles.search}>
            <PatientSearchIcon />
          </div>
          <p className={styles.searchPatientText}>{t('searchForPatient', 'Search for a patient')}</p>
          <p className={styles.bodyShort02}>{t('typePatientName', `Type a patient's name or`)} </p> <b></b>
          <p className={styles.bodyShort02}>{t('uniqueIDNumber', 'unique ID number')}</p>
        </Tile>

        <h5 className={styles.separator}>
          <span className={styles.span}>{t('or', 'or')}</span>
        </h5>

        <Button
          kind="ghost"
          className={styles.advanceSearchButton}
          iconDescription="Advanced Search"
          onClick={() => handleAdvanceSearch(SearchMode.advance)}>
          {t('advancedSearch', 'Advanced Search')}
        </Button>
      </div>
    </div>
  );
};

export default PatientSimpleSearch;
