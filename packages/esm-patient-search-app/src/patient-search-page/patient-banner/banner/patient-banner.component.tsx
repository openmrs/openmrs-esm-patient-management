import React, { useCallback, useState, useMemo } from 'react';
import classNames from 'classnames';
import { SkeletonIcon, SkeletonText } from '@carbon/react';
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
  navigate,
} from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../../../config-schema';
import { type SearchedPatient } from '../../../types';
import { mapToFhirPatient } from '../../../utils/fhir-mapper';
import styles from './patient-banner.scss';

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patient: fhir.Patient;
  patientClickSideEffect?: (patientUuid: string, patient: fhir.Patient) => void;
  onPatientSelected?(
    patientUuid: string,
    patient: fhir.Patient,
    launchChildWorkspace: (workspaceName: string, workspaceProps?: object) => void,
    closeWorkspace: () => void,
  ): void;
  launchChildWorkspace?(workspaceName: string, workspaceProps?: object): void;
  closeWorkspace?(): void;
}

interface PatientBannerProps {
  patient: SearchedPatient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
  patientClickSideEffect?: (patientUuid: string, patient: fhir.Patient) => void;
  onPatientSelected?(
    patientUuid: string,
    patient: fhir.Patient,
    launchChildWorkspace: (workspaceName: string, workspaceProps?: object) => void,
    closeWorkspace: () => void,
  ): void;
  launchChildWorkspace?(workspaceName: string, workspaceProps?: object): void;
  closeWorkspace?(): void;
  startVisitWorkspaceName?: string;
}

const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  patientUuid,
  hideActionsOverflow: hideActionsOverflowProp,
  patientClickSideEffect,
  onPatientSelected,
  launchChildWorkspace,
  closeWorkspace,
  startVisitWorkspaceName,
}) => {
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const { activeVisit } = useVisit(patientUuid);

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
        <ClickablePatientContainer
          patient={fhirMappedPatient}
          patientClickSideEffect={patientClickSideEffect}
          onPatientSelected={onPatientSelected}
          launchChildWorkspace={launchChildWorkspace}
          closeWorkspace={closeWorkspace}>
          <div className={styles.patientAvatar}>
            <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
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
            {!isDeceased && !activeVisit && (
              <ExtensionSlot
                name="start-visit-button-slot2"
                state={{
                  patientUuid,
                  launchChildWorkspace,
                  startVisitWorkspaceName,
                }}
              />
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
};

const ClickablePatientContainer = ({
  patient,
  children,
  patientClickSideEffect,
  onPatientSelected,
  launchChildWorkspace,
  closeWorkspace,
}: ClickablePatientContainerProps) => {
  const config = useConfig<PatientSearchConfig>();
  const patientUuid = patient.id;

  if (onPatientSelected) {
    return (
      <button
        className={classNames(styles.patientBannerButton, styles.patientBanner, {
          [styles.patientAvatarButton]: onPatientSelected,
        })}
        key={patientUuid}
        onClick={() => {
          onPatientSelected(patient.id, patient, launchChildWorkspace, closeWorkspace);
          patientClickSideEffect?.(patient.id, patient);
        }}>
        {children}
      </button>
    );
  } else {
    return (
      <ConfigurableLink
        className={styles.patientBanner}
        onBeforeNavigate={() => patientClickSideEffect?.(patient.id, patient)}
        to={config.search.patientChartUrl}
        templateParams={{ patientUuid: patientUuid }}>
        {children}
      </ConfigurableLink>
    );
  }
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
