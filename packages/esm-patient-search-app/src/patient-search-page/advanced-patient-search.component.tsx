import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useInfinitePatientSearch } from '../patient-search.resource';
import { type AdvancedPatientSearchState } from '../types';
import PatientSearchComponent from './patient-search-lg.component';
import RefineSearch, { initialFilters } from './refine-search/refine-search.component';
import styles from './advanced-patient-search.scss';
import dayjs from 'dayjs';

interface AdvancedPatientSearchProps {
  query: string;
  inTabletOrOverlay?: boolean;
  stickyPagination?: boolean;
}

const AdvancedPatientSearchComponent: React.FC<AdvancedPatientSearchProps> = ({
  query,
  stickyPagination,
  inTabletOrOverlay,
}) => {
  const [filters, setFilters] = useState<AdvancedPatientSearchState>(initialFilters);
  const filtersApplied = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'attributes' && value !== initialFilters[key]) {
        count++;
      }
    });

    const attributesWithValues = Object.entries(filters.attributes || {}).filter(([_, value]) => value !== '');
    count += attributesWithValues.length;
    return count;
  }, [filters]);

  const {
    data: searchResults,
    currentPage,
    setPage,
    hasMore,
    isLoading,
    fetchError,
  } = useInfinitePatientSearch(query, false, !!query, 50);

  useEffect(() => {
    if (searchResults?.length === currentPage * 50 && hasMore) {
      setPage((page) => page + 1);
    }
  }, [searchResults, currentPage, hasMore, setPage]);

  const filteredResults = useMemo(() => {
    if (searchResults && filtersApplied) {
      return searchResults.filter((patient: fhir.Patient) => {

        if (filters.gender !== 'any') {
          if (patient.gender?.toLowerCase() !== filters.gender.toLowerCase()) {
            return false;
          }
        }

        if (filters.dateOfBirth || filters.monthOfBirth || filters.yearOfBirth) {
          if (patient.birthDate) {
            const birthDate = new Date(patient.birthDate);

            if (filters.dateOfBirth && birthDate.getDate() !== filters.dateOfBirth) {
              return false;
            }

            if (filters.monthOfBirth && birthDate.getMonth() + 1 !== filters.monthOfBirth) {
              return false;
            }

            if (filters.yearOfBirth && birthDate.getFullYear() !== filters.yearOfBirth) {
              return false;
            }
          }
        }

        if (filters.postcode) {
          const matches = patient.address?.some(
            (address) =>
              address.postalCode?.toLowerCase() === filters.postcode.toLowerCase(),
          );
          if (!matches) return false;
        }

        if (filters.age && patient.birthDate) {
          const age = dayjs().diff(dayjs(patient.birthDate), 'years');
          if (Number(age) !== Number(filters.age)) {
            return false;
          }
        }

        if (Object.keys(filters.attributes).length && patient.extension) {
          for (const [url, value] of Object.entries(filters.attributes)) {
            if (!value) continue;

            const matchingExtension = patient.extension.find(
              (ext) => ext.url === url && String(ext.valueString || '').toLowerCase() === value.toLowerCase(),
            );

            if (!matchingExtension) return false;
          }
        }

        return true;
      });
    }

    return searchResults;
  }, [filtersApplied, filters, searchResults]);

  return (
    <div
      className={classNames({
        [styles.advancedPatientSearchTabletOrOverlay]: inTabletOrOverlay,
        [styles.advancedPatientSearchDesktop]: !inTabletOrOverlay,
      })}
    >
      {!inTabletOrOverlay && (
        <div className={styles.refineSearchDesktop}>
          <RefineSearch
            filtersApplied={filtersApplied}
            setFilters={setFilters}
            inTabletOrOverlay={inTabletOrOverlay}
          />
        </div>
      )}

      <div
        className={classNames({
          [styles.patientSearchResultsTabletOrOverlay]: inTabletOrOverlay,
          [styles.patientSearchResultsDesktop]: !inTabletOrOverlay,
        })}
      >
        <PatientSearchComponent
          query={query}
          stickyPagination={stickyPagination}
          inTabletOrOverlay={inTabletOrOverlay}
          isLoading={isLoading}
          fetchError={fetchError}
          searchResults={filteredResults ?? []}
        />
      </div>

      {inTabletOrOverlay && (
        <RefineSearch
          filtersApplied={filtersApplied}
          setFilters={setFilters}
          inTabletOrOverlay={inTabletOrOverlay}
        />
      )}
    </div>
  );
};

export default AdvancedPatientSearchComponent;
