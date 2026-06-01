import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Loading } from '@carbon/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  ConfigurableLink,
  getPatientName,
  interpolateString,
  PatientBannerPatientInfo,
  PatientPhoto,
  useConfig,
} from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../config-schema';
import Loader from './loader.component';
import { usePatientSearchContext } from '../patient-search-context';
import { mapToFhirPatient } from '../utils/fhir-mapper';
import type { SearchedPatient } from '../types';
import styles from './compact-patient-banner.scss';

// OpenMRS base assumption
const remInPixels = 16;

// Estimated row height used before a row is measured. Rows are measured individually and may grow
// (roughly 5.625rem–7.5rem), so this only needs to be close.
const estimatedRowHeight = 5.625 * remInPixels;

// Rows rendered above and below the viewport. With the ~4-row viewport this keeps roughly 16
// patients mounted as a scroll buffer. This is independent of pagination: see the fetch trigger,
// which keys off the visible range, so buffering more rows doesn't pull an extra page over the wire.
const overscan = 6;

// Start loading the next page when the visible range reaches within this many rows of the end, so
// the next page arrives just before the user hits the bottom rather than stalling there.
const fetchLookAhead = 2;

export interface CompactPatientBannerHandle {
  /** Scroll the result at `index` into view and move focus to it (for arrow-key navigation). */
  focusSearchResult: (index: number) => void;
}

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patient: fhir.Patient;
}

interface CompactPatientBannerProps {
  patients: Array<SearchedPatient>;
  hasMore?: boolean;
  isValidating?: boolean;
  /** Loads the next page; called when the last result scrolls into view. */
  fetchMore?: () => void;
  /**
   * Virtualize the list, mounting only the rows near the viewport. Defaults to `true`.
   * Pass `false` for an already-bounded list  so every row stays mounted and never
   * flickers to a skeleton.
   */
  virtualize?: boolean;
}

/**
 * Renders the patient search results as a list of compact banners. By default the list is
 * virtualized and infinitely-scrolling, mounting only the rows near the viewport.
 */
const CompactPatientBanner = forwardRef<CompactPatientBannerHandle, CompactPatientBannerProps>(
  ({ patients, hasMore = false, isValidating = false, fetchMore, virtualize = true }, ref) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [pendingFocusIndex, setPendingFocusIndex] = useState<number | null>(null);
    // Patients we've already shown as real banners, so a resumed scroll doesn't replace rows still
    // on screen with skeletons.
    const seenPatientUuids = useRef<Set<string>>(new Set());

    // When not virtualizing, give the virtualizer no items so it stays inert (no scroll management,
    // no virtual rows) — the full list is rendered directly below instead.
    const virtualizer = useVirtualizer({
      count: virtualize ? patients.length : 0,
      getScrollElement: () => scrollContainerRef.current,
      estimateSize: () => estimatedRowHeight,
      overscan,
      getItemKey: (index) => patients[index]?.uuid ?? index,
    });

    const virtualItems = virtualizer.getVirtualItems();

    // Load the next page once the visible range reaches within `fetchLookAhead` rows of the end. We
    // key off the visible range (not the rendered/overscan window) so the buffer of mounted rows
    // above can grow without dragging the next page over the wire ahead of time.
    const lastVisibleIndex = virtualizer.range?.endIndex ?? -1;
    useEffect(() => {
      if (virtualize && lastVisibleIndex >= patients.length - 1 - fetchLookAhead && hasMore && !isValidating) {
        fetchMore?.();
      }
    }, [virtualize, lastVisibleIndex, patients.length, hasMore, isValidating, fetchMore]);

    // Once the list settles, record the rows that rendered as real banners (only the virtualized
    // list swaps in skeletons, so this bookkeeping is unnecessary otherwise).
    useEffect(() => {
      if (virtualize && !virtualizer.isScrolling) {
        for (const item of virtualItems) {
          const uuid = patients[item.index]?.uuid;
          if (uuid) {
            seenPatientUuids.current.add(uuid);
          }
        }
      }
    }, [virtualize, virtualizer.isScrolling, virtualItems, patients]);

    useImperativeHandle(
      ref,
      () => ({
        // The row may not be mounted yet; focus it once it renders (see effect below).
        focusSearchResult: (index: number) => setPendingFocusIndex(index),
      }),
      [],
    );

    useEffect(() => {
      if (pendingFocusIndex === null) {
        return;
      }
      if (pendingFocusIndex >= patients.length) {
        // The list shrank (e.g. the query changed) and the target row no longer exists; stop here so
        // we don't re-run scrollToIndex on every render chasing a row that will never render.
        setPendingFocusIndex(null);
        return;
      }
      const row = scrollContainerRef.current?.querySelector<HTMLElement>(`[data-index="${pendingFocusIndex}"]`);
      const focusable = row?.querySelector<HTMLElement>('a, button');
      if (focusable) {
        // Keep this row a real banner so focus isn't lost when it would otherwise revert to a
        // skeleton. Use the native focus scroll (rather than the virtualizer's) to bring it into
        // view — the two fight each other and leave the row partly out of view.
        const uuid = patients[pendingFocusIndex]?.uuid;
        if (uuid) {
          seenPatientUuids.current.add(uuid);
        }
        focusable.focus();
        setPendingFocusIndex(null);
      } else {
        // The row isn't rendered yet (a jump beyond the overscan window). Scroll it into range and
        // let this effect retry when the rendered rows change.
        virtualizer.scrollToIndex(pendingFocusIndex, { align: 'auto' });
      }
    }, [pendingFocusIndex, patients, virtualItems, virtualizer]);

    return (
      // The bounding height is also set inline so the virtualizer always measures a 22rem viewport.
      // Otherwise, the virtualizer will detect the wrong height and won't scroll properly.
      <div ref={scrollContainerRef} className={styles.virtualScrollContainer} style={{ maxBlockSize: '22rem' }}>
        {virtualize ? (
          <div style={{ blockSize: virtualizer.getTotalSize() }}>
            {virtualItems.map((virtualRow) => {
              // Show the skeleton only for patients we haven't shown yet
              const showSkeleton =
                virtualizer.isScrolling &&
                !seenPatientUuids.current.has(patients[virtualRow.index]?.uuid) &&
                virtualRow.index !== pendingFocusIndex;
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.isScrolling ? undefined : virtualizer.measureElement}
                  className={styles.virtualRow}
                  style={
                    virtualizer.isScrolling
                      ? { blockSize: virtualRow.size, transform: `translateY(${virtualRow.start}px)` }
                      : { transform: `translateY(${virtualRow.start}px)` }
                  }>
                  {showSkeleton ? <Loader /> : <CompactPatientBannerRow patient={patients[virtualRow.index]} />}
                </div>
              );
            })}
          </div>
        ) : (
          // Bounded list: every row stays mounted (the `data-index` wrapper lets arrow-key focus find
          // it, exactly as in the virtualized branch).
          patients.map((patient, index) => (
            <div key={patient.uuid} data-index={index}>
              <CompactPatientBannerRow patient={patient} />
            </div>
          ))
        )}
        {hasMore && (
          <div className={styles.loadingIcon}>
            <Loading withOverlay={false} small />
          </div>
        )}
      </div>
    );
  },
);

// Memoized so the banner subtree (photo, info, and its secondary lookups) doesn't re-render on
// every scroll frame: `patient` references are stable across renders and when new pages append, so
// only genuinely-changed rows re-render.
const CompactPatientBannerRow = React.memo(({ patient }: { patient: SearchedPatient }) => {
  const fhirPatient = useMemo(() => mapToFhirPatient(patient), [patient]);
  const patientName = getPatientName(fhirPatient);

  return (
    <ClickablePatientContainer patient={fhirPatient}>
      <div className={styles.patientAvatar}>
        <PatientPhoto patientUuid={fhirPatient.id} patientName={patientName} />
      </div>
      <PatientBannerPatientInfo patient={fhirPatient} />
    </ClickablePatientContainer>
  );
});
CompactPatientBannerRow.displayName = 'CompactPatientBannerRow';

const ClickablePatientContainer = ({ patient, children }: ClickablePatientContainerProps) => {
  const { nonNavigationSelectPatientAction, patientClickSideEffect } = usePatientSearchContext();
  const config = useConfig<PatientSearchConfig>();
  const isDeceased = Boolean(patient?.deceasedDateTime);

  if (nonNavigationSelectPatientAction) {
    return (
      <button
        className={classNames(styles.patientSearchResult, styles.patientSearchResultButton)}
        key={patient.id}
        onClick={() => {
          nonNavigationSelectPatientAction(patient.id, patient);
          patientClickSideEffect?.(patient.id, patient);
        }}
        {...(isDeceased ? { 'data-deceased': 'true' } : {})}>
        {children}
      </button>
    );
  }

  return (
    <ConfigurableLink
      className={classNames(styles.patientSearchResult)}
      key={patient.id}
      onBeforeNavigate={() => patientClickSideEffect?.(patient.id, patient)}
      to={interpolateString(config.search.patientChartUrl, {
        patientUuid: patient.id,
      })}
      {...(isDeceased ? { 'data-deceased': 'true' } : {})}>
      {children}
    </ConfigurableLink>
  );
};

export default CompactPatientBanner;
