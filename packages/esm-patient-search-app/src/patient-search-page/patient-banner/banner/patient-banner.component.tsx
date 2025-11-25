import React, { useCallback, useState } from 'react';
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
  getPatientName,
} from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../../../config-schema';
import { usePatientSearchContext, usePatientSearchContext2 } from '../../../patient-search-context';
import styles from './patient-banner.scss';

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patient: fhir.Patient;
}

interface PatientBannerProps {
  patient: fhir.Patient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
}

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid, hideActionsOverflow }) => {
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const { activeVisit } = useVisit(patientUuid);
  const { nonNavigationSelectPatientAction, hidePatientSearch, handleReturnToSearchList } =
    usePatientSearchContext() ?? {};
  const context2 = usePatientSearchContext2();
  const { onPatientSelected, launchChildWorkspace, startVisitWorkspaceName } = context2 ?? {};

  const patientName = getPatientName(patient);

  const isDeceased = patient.deceasedBoolean;

  const [showContactDetails, setShowContactDetails] = useState(false);

  const handleToggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  return (
    <>
      <div
        className={classNames(styles.container, {
          [styles.deceasedPatientContainer]: isDeceased,
          [styles.activePatientContainer]: !isDeceased,
        })}
        role="banner">
        <ClickablePatientContainer patient={patient}>
          <div className={styles.patientAvatar} role="img">
            <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
          </div>
          <PatientBannerPatientInfo patient={patient} />
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
                  selectPatientAction: onPatientSelected ?? nonNavigationSelectPatientAction,
                  launchPatientChart: true,
                }}
                patient={patient}
                patientUuid={patientUuid}
              />
            ) : null}
            {!isDeceased &&
              !activeVisit &&
              (context2 ? (
                <ExtensionSlot
                  name="start-visit-button-slot2"
                  state={{
                    patientUuid,
                    launchChildWorkspace,
                    startVisitWorkspaceName,
                  }}
                />
              ) : (
                <ExtensionSlot
                  name="start-visit-button-slot"
                  state={{
                    handleReturnToSearchList,
                    hidePatientSearch,
                    patientUuid,
                  }}
                />
              ))}
          </div>
        </div>

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
    </>
  );
};

const ClickablePatientContainer = ({ patient, children }: ClickablePatientContainerProps) => {
  const { nonNavigationSelectPatientAction, patientClickSideEffect } = usePatientSearchContext() ?? {};
  const context2 = usePatientSearchContext2();
  const { onPatientSelected, closeWorkspace, launchChildWorkspace } = context2 ?? {};
  const config = useConfig<PatientSearchConfig>();
  const patientUuid = patient.id;

  const handleClick = useCallback(() => {
    nonNavigationSelectPatientAction?.(patientUuid, patient);
    patientClickSideEffect?.(patientUuid, patient);
  }, [nonNavigationSelectPatientAction, patientClickSideEffect, patientUuid, patient]);

  const handleBeforeNavigate = useCallback(() => {
    patientClickSideEffect?.(patientUuid, patient);
  }, [patientClickSideEffect, patientUuid, patient]);

  if (context2) {
    return (
      <button
        className={classNames(styles.patientBannerButton, styles.patientBanner, {
          [styles.patientAvatarButton]: nonNavigationSelectPatientAction,
        })}
        key={patientUuid}
        onClick={() => {
          if (onPatientSelected) {
            onPatientSelected(patient.id, patient, launchChildWorkspace, closeWorkspace);
          } else {
            navigate({
              to: config.search.patientChartUrl,
              templateParams: { patientUuid },
            });
          }
        }}>
        {children}
      </button>
    );
  } else if (nonNavigationSelectPatientAction) {
    return (
      <button
        className={classNames(styles.patientBannerButton, styles.patientBanner, {
          [styles.patientAvatarButton]: nonNavigationSelectPatientAction,
        })}
        key={patientUuid}
        onClick={handleClick}>
        {children}
      </button>
    );
  }

  return (
    <ConfigurableLink
      className={styles.patientBanner}
      onBeforeNavigate={handleBeforeNavigate}
      to={config.search.patientChartUrl}
      templateParams={{ patientUuid }}>
      {children}
    </ConfigurableLink>
  );
};

export const PatientBannerSkeleton = () => (
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

export default PatientBanner;

