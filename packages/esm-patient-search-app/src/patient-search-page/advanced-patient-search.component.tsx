import React, { useEffect, useMemo, useState } from 'react';
import { useGetPatientAttributePhoneUuid, usePatientSearchInfinite } from '../patient-search.resource';
import { AdvancedPatientSearchState } from '../types';
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

const AdvancedPatientSearchComponent: React.FC<AdvancedPatientSearchProps> = ({
  query,
  stickyPagination,
  selectPatientAction,
  inTabletOrOverlay,
  hidePanel,
}) => {
  const [filters, setFilters] = useState<AdvancedPatientSearchState>(initialState);
  const filtersApplied = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (value != initialState[key]) {
        count++;
      }
    });
    return count;
  }, [filters]);

  const {
    data: searchResults,
    currentPage,
    setPage,
    hasMore,
    isLoading,
    fetchError,
  } = usePatientSearchInfinite(query, false, !!query, 50);

  useEffect(() => {
    if (searchResults?.length === currentPage * 50 && hasMore) {
      setPage((page) => page + 1);
    }
  }, [searchResults, currentPage, hasMore, setPage]);

  const filteredResults = useMemo(() => {
    if (searchResults && filtersApplied) {
      return searchResults.filter((patient) => {
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
          if (dayOfBirth !== filters.dateOfBirth) {
            return false;
          }
        }

        if (filters.monthOfBirth) {
          const monthOfBirth = new Date(patient.person.birthdate).getMonth() + 1;
          if (monthOfBirth !== filters.monthOfBirth) {
            return false;
          }
        }

        if (filters.yearOfBirth) {
          const yearOfBirth = new Date(patient.person.birthdate).getFullYear();
          if (yearOfBirth !== filters.yearOfBirth) {
            return false;
          }
        }

        if (filters.postcode) {
          if (!patient.person.addresses.some((address) => address.postalCode === filters.postcode)) {
            return false;
          }
        }

        if (filters.age) {
          if (patient.person.age !== filters.age) {
            return false;
          }
        }

        if (filters.phoneNumber) {
          if (
            !(
              patient.attributes.find((attr) => attr.attributeType.display === 'Telephone Number')?.value ===
              filters.phoneNumber.toString()
            )
          ) {
            return false;
          }
        }

        return true;
      });
    }

    return searchResults;
  }, [filtersApplied, filters, searchResults]);

  return (
    <div
      className={`${
        !inTabletOrOverlay ? styles.advancedPatientSearchDesktop : styles.advancedPatientSearchTabletOrOverlay
      }`}>
      {!inTabletOrOverlay && (
        <div className={styles.refineSearchDesktop}>
          <RefineSearch filtersApplied={filtersApplied} setFilters={setFilters} inTabletOrOverlay={inTabletOrOverlay} />
        </div>
      )}
      <div
        className={`${
          !inTabletOrOverlay ? styles.patientSearchResultsDesktop : styles.patientSearchResultsTabletOrOverlay
        }`}>
        <PatientSearchComponent
          query={query}
          stickyPagination={stickyPagination}
          selectPatientAction={selectPatientAction}
          inTabletOrOverlay={inTabletOrOverlay}
          hidePanel={hidePanel}
          isLoading={isLoading}
          fetchError={fetchError}
          searchResults={filteredResults ?? []}
        />
      </div>
      {inTabletOrOverlay && (
        <RefineSearch filtersApplied={filtersApplied} setFilters={setFilters} inTabletOrOverlay={inTabletOrOverlay} />
      )}
    </div>
  );
};

export default AdvancedPatientSearchComponent;
