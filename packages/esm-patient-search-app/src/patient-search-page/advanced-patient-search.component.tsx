import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames';
import { useConfig, type OpenmrsResource } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import { useInfinitePatientSearch } from '../patient-search.resource';
import { type AdvancedPatientSearchState } from '../types';
import PatientSearchComponent from './patient-search-lg.component';
import RefineSearch, { initialFilters } from './refine-search/refine-search.component';
import styles from './advanced-patient-search.scss';

const resultsPerPage = 50;

/**
 * How many pages to request at once. Every page of a result set still gets loaded — this only
 * bounds how many are in flight together, so a broad query arrives in a handful of waves instead of
 * one burst of requests at the backend.
 *
 * Deliberately small. The REST patient search re-runs the whole search and hydration on every page
 * request and applies `startIndex` in memory at the end, so each page in a wave costs a full search
 * at the backend, not a slice of one. Paging serially held that to one at a time; this trades a
 * bounded amount of concurrency for far fewer round trips, and four is low enough for a modest
 * install to absorb when several people are searching at once.
 */
const pagesPerWave = 4;

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
  const { includeDead } = useConfig<PatientSearchConfig>();
  const [filters, setFilters] = useState<AdvancedPatientSearchState>(initialFilters);
  const filtersApplied = useMemo(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'attributes' && value !== initialFilters[key]) {
        count++;
      }
    });

    const attributesWithValues = Object.entries(filters.attributes || {}).filter(([key, value]) => value !== '');

    count += attributesWithValues.length;
    return count;
  }, [filters]);

  const {
    data: searchResults,
    currentPage,
    setPage,
    isLoading,
    isValidating,
    fetchError,
    totalResultsForQuery,
  } = useInfinitePatientSearch(query, includeDead, !!query, resultsPerPage);

  // The refine-search filters and the result count below both run over the rows held on the client,
  // so the whole result set has to be loaded. `useInfinitePatientSearch` fetches pages in parallel,
  // so request them a wave at a time: `person.searchMaxResults` caps the search at 1000 patients by
  // default, so even a broad query is around twenty pages, and those arrive in five waves rather
  // than twenty sequential round trips — without leaving any patient unreachable. Waiting on
  // `isValidating` is what keeps a wave from being requested on top of the one still in flight —
  // `currentPage` advances as soon as the pages are asked for, not when they land, so without it
  // every wave would collapse back into a single burst.
  const pagesNeeded = Math.ceil(totalResultsForQuery / resultsPerPage);

  // A failed request also ends the wave, so stop on `fetchError`: the count that `pagesNeeded` is
  // derived from survives the failure, and the loop would otherwise keep opening waves for a result
  // set the user is no longer being shown.
  useEffect(() => {
    if (!fetchError && !isValidating && pagesNeeded > currentPage) {
      setPage(Math.min(currentPage + pagesPerWave, pagesNeeded));
    }
  }, [fetchError, isValidating, pagesNeeded, currentPage, setPage]);

  const filteredResults = useMemo(() => {
    if (searchResults && filtersApplied) {
      return searchResults.filter((patient) => {
        // Gender filter
        if (filters.gender !== 'any') {
          const genderMap = {
            male: 'M',
            female: 'F',
            other: 'O',
            unknown: 'U',
          };
          if (patient.person.gender !== genderMap[filters.gender]) {
            return false;
          }
        }

        // Date of birth filters
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

        // Postcode filter
        if (filters.postcode) {
          if (!patient.person.addresses.some((address) => address.postalCode === filters.postcode)) {
            return false;
          }
        }

        // Age filter
        if (filters.age) {
          if (Number(patient.person.age) !== Number(filters.age)) {
            return false;
          }
        }

        // Person attributes filter
        if (Object.keys(filters.attributes).length) {
          for (const [attributeUuid, value] of Object.entries(filters.attributes)) {
            if (value === '') continue;

            const matchingAttribute = patient.attributes.find((attr) => attr.attributeType.uuid === attributeUuid);

            if (!matchingAttribute) return false;

            const isValueObj = typeof matchingAttribute.value === 'object';
            const patientAttributeValue = isValueObj
              ? (matchingAttribute.value as OpenmrsResource).uuid
              : matchingAttribute.value;
            if ((patientAttributeValue as string).toLowerCase() !== value.toLowerCase()) {
              return false;
            }
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
      })}>
      {!inTabletOrOverlay && (
        <div className={styles.refineSearchDesktop}>
          <RefineSearch filtersApplied={filtersApplied} setFilters={setFilters} inTabletOrOverlay={inTabletOrOverlay} />
        </div>
      )}
      <div
        className={classNames({
          [styles.patientSearchResultsTabletOrOverlay]: inTabletOrOverlay,
          [styles.patientSearchResultsDesktop]: !inTabletOrOverlay,
        })}>
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
        <RefineSearch filtersApplied={filtersApplied} setFilters={setFilters} inTabletOrOverlay={inTabletOrOverlay} />
      )}
    </div>
  );
};

export default AdvancedPatientSearchComponent;
