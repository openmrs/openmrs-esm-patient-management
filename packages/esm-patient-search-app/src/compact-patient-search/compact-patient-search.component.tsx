import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { navigate, interpolateString, useConfig, useSession, useDebounce, showSnackbar } from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import { type SearchedPatient } from '../types';
import { useRecentlyViewedPatients, useInfinitePatientSearch, useRestPatients } from '../patient-search.resource';
import { PatientSearchContextProvider } from '../patient-search-context';
import useArrowNavigation from '../hooks/useArrowNavigation';
import PatientSearch from './patient-search.component';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import RecentlySearchedPatients from './recently-searched-patients.component';
import styles from './compact-patient-search.scss';

export interface CompactPatientSearchProps {
  isSearchPage?: boolean;
  initialSearchTerm?: string;
  selectPatientAction?: (patientUuid: string) => void;
  shouldNavigateToPatientSearchPage?: boolean;
  onPatientSelect?: () => void;
  buttonProps?: object;
}

const CompactPatientSearchComponent: React.FC<CompactPatientSearchProps> = ({
  initialSearchTerm = '',
  isSearchPage = false,
  selectPatientAction,
  shouldNavigateToPatientSearchPage,
  onPatientSelect,
  buttonProps,
}) => {
  const { t } = useTranslation();

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const bannerContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const debouncedSearchTerm = useDebounce(searchTerm);
  const hasSearchTerm = Boolean(debouncedSearchTerm?.trim());

  const config = useConfig<PatientSearchConfig>();
  const { showRecentlySearchedPatients } = config.search;

  // FIX 1: removed unused `currentLocation` destructure from useSession
  useSession();

  const patientSearchResponse = useInfinitePatientSearch(debouncedSearchTerm, config.includeDead);
  const { data: searchedPatients } = patientSearchResponse;

  // Recently-viewed patients are only tracked when NOT in selectPatientAction mode
  const shouldTrackRecent = showRecentlySearchedPatients && !selectPatientAction;

  const {
    error: errorFetchingUserProperties,
    isLoadingPatients,
    mutateUserProperties,
    recentlyViewedPatientUuids,
    updateRecentlyViewedPatients,
  } = useRecentlyViewedPatients(shouldTrackRecent);

  const recentPatientSearchResponse = useRestPatients(recentlyViewedPatientUuids, !hasSearchTerm && shouldTrackRecent);

  // FIX 6: useRestPatients returns data: SearchedPatient[] | null, not undefined.
  // Spread it separately so TypeScript sees the correct shape for RecentlySearchedPatients.
  const { data: recentPatients, fetchError } = recentPatientSearchResponse;

  // ── Focus helpers ────────────────────────────────────────────────────────────

  const handleFocusToInput = useCallback(() => {
    if (searchInputRef.current) {
      const input = searchInputRef.current;
      input.setSelectionRange(input.value.length, input.value.length);
      input.focus();
    }
  }, []);

  // ── Selection / close ────────────────────────────────────────────────────────

  const closeSearchResults = useCallback(() => {
    setSearchTerm('');
    onPatientSelect?.();
  }, [onPatientSelect]);

  const recordRecentAndClose = useCallback(
    async (patientUuid: string) => {
      closeSearchResults();
      if (!shouldTrackRecent) return;
      try {
        await updateRecentlyViewedPatients(patientUuid);
        await mutateUserProperties();
      } catch (error) {
        showSnackbar({
          kind: 'error',
          title: t('errorUpdatingRecentlyViewedPatients', 'Error updating recently viewed patients'),
          subtitle: error instanceof Error ? error.message : String(error),
        });
      }
    },
    [closeSearchResults, mutateUserProperties, updateRecentlyViewedPatients, shouldTrackRecent, t],
  );

  // FIX 2 + 3: typed `evt` explicitly; made `patients` optional to match the
  // useArrowNavigation enterCallback signature (patients?: Array<SearchedPatient>)
  const handlePatientSelection = useCallback(
    (evt: React.MouseEvent<HTMLAnchorElement>, index: number, patients?: Array<SearchedPatient>) => {
      evt.preventDefault();
      if (!patients) return;

      const { uuid } = patients[index];

      if (selectPatientAction) {
        selectPatientAction(uuid);
        setSearchTerm('');
      } else {
        recordRecentAndClose(uuid);
        navigate({
          to: interpolateString(config.search.patientChartUrl, { patientUuid: uuid }),
        });
      }
    },
    [selectPatientAction, recordRecentAndClose, config.search.patientChartUrl],
  );

  // ── Arrow-key navigation ─────────────────────────────────────────────────────

  const focusedResult = useArrowNavigation(
    recentPatients ? (recentPatients?.length ?? 0) : (searchedPatients?.length ?? 0),
    handlePatientSelection,
    handleFocusToInput,
    -1,
    searchContainerRef,
  );

  useEffect(() => {
    // FIX 4: bannerContainerRef is typed as HTMLDivElement (not `never`),
    // so .children is valid. The `never` arose from `useRef(null)` without a type arg.
    if (bannerContainerRef.current && focusedResult > -1) {
      const child = bannerContainerRef.current.children?.[focusedResult] as HTMLElement | undefined;
      child?.focus();
      child?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    } else if (bannerContainerRef.current && focusedResult === -1) {
      handleFocusToInput();
    }
  }, [focusedResult, handleFocusToInput]);

  // ── Error snackbars ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (fetchError) {
      showSnackbar({
        kind: 'error',
        title: t('errorFetchingPatients', 'Error fetching patients'),
        subtitle: fetchError?.message,
      });
    }
    if (errorFetchingUserProperties) {
      showSnackbar({
        kind: 'error',
        title: t('errorFetchingUserProperties', 'Error fetching user properties'),
        subtitle: errorFetchingUserProperties?.message,
      });
    }
  }, [fetchError, errorFetchingUserProperties, t]);

  // ── Search bar callbacks ─────────────────────────────────────────────────────

  const handleSubmit = useCallback(
    (term: string) => {
      if (shouldNavigateToPatientSearchPage && term?.trim()) {
        if (!isSearchPage) {
          window.sessionStorage.setItem('searchReturnUrl', window.location.pathname);
        }
        // FIX 5: openmrsSpaBase is a webpack DefinePlugin global — must use the
        // exact escaped template-literal syntax `\${openmrsSpaBase}` so the
        // TypeScript compiler treats it as a runtime string substitution, not a
        // TS variable reference. This matches how the original file used it.
        navigate({ to: `\${openmrsSpaBase}/search?query=${encodeURIComponent(term)}` });
      }
    },
    [isSearchPage, shouldNavigateToPatientSearchPage],
  );

  const handleClear = useCallback(() => setSearchTerm(''), []);

  const handleSearchTermChange = useCallback((term: string) => setSearchTerm(term ?? ''), []);

  // ── Render ───────────────────────────────────────────────────────────────────

  const showFloatingResults = !isSearchPage && (hasSearchTerm || (!hasSearchTerm && shouldTrackRecent));

  return (
    <PatientSearchContextProvider
      value={{
        nonNavigationSelectPatientAction: selectPatientAction,
        patientClickSideEffect: selectPatientAction ? handleClear : recordRecentAndClose,
      }}>
      <div className={styles.patientSearchBar} ref={searchContainerRef}>
        <PatientSearchBar
          isCompact
          initialSearchTerm={initialSearchTerm ?? ''}
          onChange={handleSearchTermChange}
          onSubmit={handleSubmit}
          onClear={handleClear}
          buttonProps={buttonProps}
          ref={searchInputRef}
        />

        {showFloatingResults && (
          <div
            className={styles.floatingSearchResultsContainer}
            data-testid="floatingSearchResultsContainer"
            data-tutorial-target="floating-search-results-container">
            {hasSearchTerm ? (
              <PatientSearch query={debouncedSearchTerm} ref={bannerContainerRef} {...patientSearchResponse} />
            ) : (
              <RecentlySearchedPatients
                ref={bannerContainerRef}
                {...recentPatientSearchResponse}
                data={recentPatients ?? undefined}
                fetchError={recentPatientSearchResponse.fetchError ?? (null as unknown as Error)}
                isLoading={recentPatientSearchResponse.isLoading || isLoadingPatients}
              />
            )}
          </div>
        )}
      </div>
    </PatientSearchContextProvider>
  );
};

export default CompactPatientSearchComponent;
