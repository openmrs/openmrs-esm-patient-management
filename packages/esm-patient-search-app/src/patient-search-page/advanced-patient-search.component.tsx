import { useLayoutType } from '@openmrs/esm-framework';
import React, { useEffect, useMemo, useState } from 'react';
import PatientSearchResults from '../compact-patient-search/compact-patient-banner.component';
import { usePatientSearchInfinite } from '../patient-search.resource';
import { AdvancedPatientSearchState, SearchedPatient } from '../types';
import styles from './advanced-patient-search.scss';
import { initialState } from './advanced-search-reducer';
import PatientSearchComponent from './patient-search-lg.component';
import RefineSearch from './refine-search.component';

interface AdvancedPatientSearchProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
  selectPatientAction?: (patientUuid: string) => void;
  hidePanel?: () => void;
}

const AdvancedPatientSearchComponent: React.FC<AdvancedPatientSearchProps> = (props) => {
  const { inTabletOrOverlay } = props;
  const [filters, setFilters] = useState<AdvancedPatientSearchState>(initialState);
  const filtersApplied = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value != initialState[key]) count++;
    });
    return count;
  }, [filters, initialState]);

  const {
    data: searchResults,
    currentPage,
    setPage,
    hasMore,
    isLoading,
    fetchError,
  } = usePatientSearchInfinite(props.query, false, !!props.query, 50);

  useEffect(() => {
    if (searchResults?.length == currentPage * 50 && hasMore) {
      setPage((page) => page + 1);
    }
  }, [searchResults, currentPage, hasMore]);

  const filteredResults = useMemo(() => {
    if (searchResults && filtersApplied) {
      let filteredResults: Array<SearchedPatient> = searchResults.filter((patient) => {
        if (filters.gender !== 'any' && patient.person.gender !== 'O' && patient.person.gender !== 'U') {
          if (filters.gender === 'male' && patient.person.gender !== 'M') {
            return false;
          }
          if (filters.gender === 'female' && patient.person.gender !== 'F') {
            return false;
          }
        }

        if (filters.dateOfBirth) {
          const dayOfBirth = new Date(patient.person.birthdate).getDate();
          console.log(patient.person.personName.display, dayOfBirth, filters.dateOfBirth);
          if (dayOfBirth !== filters.dateOfBirth) {
            return false;
          }
        }

        if (filters.monthOfBirth) {
          const monthOfBirth = new Date(patient.person.birthdate).getMonth() + 1;
          console.log(patient.person.personName.display, monthOfBirth, filters.monthOfBirth);
          if (monthOfBirth !== filters.monthOfBirth) {
            return false;
          }
        }

        if (filters.yearOfBirth) {
          const yearOfBirth = new Date(patient.person.birthdate).getFullYear();
          console.log(patient.person.personName.display, yearOfBirth, filters.yearOfBirth);
          if (yearOfBirth !== filters.yearOfBirth) {
            return false;
          }
        }

        if (filters.postcode) {
          if (!patient.person.addresses.some((address) => address.postalCode === filters.postcode)) {
            return false;
          }
        }
        return true;
      });
      return filteredResults;
    }

    return searchResults;
  }, [filtersApplied, filters, searchResults]);

  console.log(filteredResults?.length, filteredResults, searchResults);

  return (
    <div
      className={`${
        !inTabletOrOverlay ? styles.advancedPatientSearchDesktop : styles.advancedPatientSearchTabletOrOverlay
      }`}>
      {!inTabletOrOverlay && (
        <div className={styles.refineSearchDesktop}>
          <RefineSearch
            filtersApplied={filtersApplied}
            setFilters={setFilters}
            inTabletOrOverlay={props.inTabletOrOverlay}
          />
          {filteredResults && (
            <PatientSearchResults
              patients={filteredResults}
              selectPatientAction={(patient) => {
                console.log(patient.uuid);
              }}
            />
          )}
        </div>
      )}
      <div
        className={`${
          !inTabletOrOverlay ? styles.patientSearchResultsDesktop : styles.patientSearchResultsTabletOrOverlay
        }`}>
        <PatientSearchComponent {...props} />
      </div>
    </div>
  );
};

export default AdvancedPatientSearchComponent;
