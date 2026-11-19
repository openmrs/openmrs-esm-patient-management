import React, { useCallback, useState, useMemo } from 'react';
import classNames from 'classnames';
import { SWRConfig } from 'swr';
import { Button, SkeletonIcon, SkeletonText } from '@carbon/react';
import {
  ConfigurableLink,
  ExtensionSlot,
  PatientBannerActionsMenu,
  PatientBannerContactDetails,
  PatientBannerToggleContactDetailsButton,
  PatientBannerPatientInfo,
  PatientPhoto,
  useConfig,
  useLayoutType,
  useVisit,
  type Visit,
} from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../../../config-schema';
import { type SearchedPatient } from '../../../types';
import { usePatientSearchContext2 } from '../../../patient-search-context';
import { mapToFhirPatient } from '../../../utils/fhir-mapper';
import { searchResultSwrConfig } from '../../../utils/swr-config';
import styles from './patient-banner.scss';

/** Lighter-weight view that's what we actually need for checking for active visits */
const activeVisitRepresentation = 'custom:(uuid,startDatetime,stopDatetime,patient:(uuid))';

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patient: fhir.Patient;
}

interface PatientBannerProps {
  patient: SearchedPatient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
}

// Memoized: each banner carries a visit lookup, a photo, and several extension slots, so
// re-rendering rows whose patient hasn't changed is expensive.
const PatientBanner = React.memo(
  ({ patient, patientUuid, hideActionsOverflow: hideActionsOverflowProp }: PatientBannerProps) => {
    const layout = useLayoutType();
    const isTablet = layout === 'tablet';
    const { activeVisit } = useVisit(patientUuid, activeVisitRepresentation);
    const context2 = usePatientSearchContext2();
    const {
      onPatientSelected,
      onVisitStarted,
      selectPatientButton,
      launchStartVisitWorkspace,
      launchChildWorkspace,
      closeWorkspace,
    } = context2 ?? {};

    const hideActionsOverflow = hideActionsOverflowProp ?? Boolean(onPatientSelected);

    const patientName = patient.person.personName.display;
    const isDeceased = !!patient.person.deathDate;

    const [showContactDetails, setShowContactDetails] = useState(false);

    const handleToggleContactDetails = useCallback(() => {
      setShowContactDetails((value) => !value);
    }, []);

    const fhirMappedPatient: fhir.Patient = useMemo(() => mapToFhirPatient(patient), [patient]);

    return (
      <>
        <div
          className={classNames(styles.container, {
            [styles.deceasedPatientContainer]: isDeceased,
            [styles.activePatientContainer]: !isDeceased,
          })}
          role="banner">
          <ClickablePatientContainer patient={fhirMappedPatient}>
            <div className={styles.patientAvatar}>
              <SWRConfig value={searchResultSwrConfig}>
                <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
              </SWRConfig>
            </div>
            <PatientBannerPatientInfo patient={fhirMappedPatient} />
          </ClickablePatientContainer>
          <div className={styles.actionButtons}>
            <PatientBannerToggleContactDetailsButton
              className={styles.toggleContactDetailsButton}
              showContactDetails={showContactDetails}
              toggleContactDetails={handleToggleContactDetails}
            />
            <div className={styles.rightActions}>
              {!hideActionsOverflow ? (
                <PatientBannerActionsMenu
                  actionsSlotName="patient-search-actions-slot"
                  additionalActionsSlotState={{
                    selectPatientAction: onPatientSelected,
                    launchPatientChart: true,
                  }}
                  patient={fhirMappedPatient}
                  patientUuid={patientUuid}
                />
              ) : null}
              {!isDeceased && !activeVisit && context2 && (
                <ExtensionSlot
                  name="start-visit-button-slot2"
                  state={{
                    patientUuid,
                    patient: fhirMappedPatient,
                    launchStartVisitWorkspace,
                    onVisitStarted: onVisitStarted
                      ? (visit: Visit) =>
                          onVisitStarted(patientUuid, fhirMappedPatient, visit, launchChildWorkspace, closeWorkspace)
                      : undefined,
                  }}
                />
              )}
              {!isDeceased && context2 && selectPatientButton && (
                <Button
                  disabled={selectPatientButton.requiresActiveVisit && !activeVisit}
                  kind="primary"
                  onClick={() =>
                    onPatientSelected?.(patientUuid, fhirMappedPatient, launchChildWorkspace, closeWorkspace)
                  }>
                  {selectPatientButton.text}
                </Button>
              )}
            </div>
          </div>
          <div>
            {showContactDetails && (
              <div
                className={classNames(styles.contactDetails, {
                  [styles.deceasedContactDetails]: isDeceased,
                  [styles.tabletContactDetails]: isTablet,
                })}>
                <PatientBannerContactDetails deceased={isDeceased} patientId={patientUuid} />
              </div>
            )}
          </div>
        </div>
      </>
    );
  },
);
PatientBanner.displayName = 'PatientBanner';

const ClickablePatientContainer = ({ patient, children }: ClickablePatientContainerProps) => {
  const context2 = usePatientSearchContext2();
  const { onPatientSelected, selectPatientButton, onBeforeNavigateToPatient, launchChildWorkspace, closeWorkspace } =
    context2 ?? {};
  const config = useConfig<PatientSearchConfig>();
  const patientUuid = patient.id;

  const handleBeforeNavigate = useCallback(() => {
    onBeforeNavigateToPatient?.(patientUuid, patient);
  }, [onBeforeNavigateToPatient, patientUuid, patient]);

  if (selectPatientButton) {
    // Selecting a patient happens through a dedicated button on the card instead
    return (
      <div className={styles.patientBanner} key={patientUuid}>
        {children}
      </div>
    );
  }

  if (onPatientSelected) {
    return (
      <button
        className={classNames(styles.patientBannerButton, styles.patientBanner)}
        key={patientUuid}
        onClick={() => onPatientSelected(patient.id, patient, launchChildWorkspace, closeWorkspace)}>
        {children}
      </button>
    );
  }

  return (
    <ConfigurableLink
      className={styles.patientBanner}
      onBeforeNavigate={handleBeforeNavigate}
      to={config.search.patientChartUrl}
      templateParams={{ patientUuid: patientUuid }}>
      {children}
    </ConfigurableLink>
  );
};

export const PatientBannerSkeleton = () => {
  return (
    <div className={styles.container} role="banner">
      <div className={styles.patientBanner}>
        <SkeletonIcon className={styles.patientAvatar} />
        <div className={classNames(styles.patientNameRow, styles.patientInfo)}>
          <div className={styles.flexRow}>
            <SkeletonText />
          </div>
          <div className={styles.identifiers}>
            <SkeletonText />
          </div>
        </div>
      </div>
      <div className={styles.emptyStateActionButtonsContainer}>
        <SkeletonText />
      </div>
    </div>
  );
};

export default PatientBanner;
