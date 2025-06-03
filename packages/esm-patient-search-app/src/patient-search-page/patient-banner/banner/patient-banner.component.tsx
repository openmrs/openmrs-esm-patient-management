import React, { useCallback, useState, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ButtonSkeleton, SkeletonIcon, SkeletonText, Button, Tag } from '@carbon/react';
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
  UserFollowIcon,
} from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../../../config-schema';
import { type SearchedPatient } from '../../../types';
import { usePatientSearchContext } from '../../../patient-search-context';
import { mapToFhirPatient } from '../../../utils/fhir-mapper';
import styles from './patient-banner.scss';

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patientUuid: string;
}

interface PatientBannerProps {
  patient: SearchedPatient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
  isMPIPatient: boolean;
}

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid, hideActionsOverflow, isMPIPatient }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const { currentVisit } = useVisit(patientUuid);
  const { nonNavigationSelectPatientAction, showPatientSearch, hidePatientSearch, handleReturnToSearchList } =
    usePatientSearchContext();

  const patientName = patient.person.personName.display;
  const isDeceased = !!patient.person.deathDate;

  const [showContactDetails, setShowContactDetails] = useState(false);

  const handleToggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const fhirMappedPatient: fhir.Patient = useMemo(() => mapToFhirPatient(patient), [patient]);

  const handleCreatePatientRecord = (externalId: string) => {
    navigate({
      to: `${window.getOpenmrsSpaBase()}patient-registration?sourceRecord=${externalId}`,
    });
  };

  return (
    <>
      <div
        className={classNames(styles.container, {
          [styles.deceasedPatientContainer]: isDeceased,
          [styles.activePatientContainer]: !isDeceased,
        })}
        role="banner">
        <ClickablePatientContainer patientUuid={patientUuid}>
          <div className={styles.patientAvatar} role="img">
            <PatientPhoto patientUuid={patientUuid} patientName={patientName} />
          </div>
          <div>
            {isMPIPatient && (
              <div>
                <Tag className={styles.mpiTag} type="blue">
                  &#127760; {t('mpi', 'MPI')}
                </Tag>
              </div>
            )}
          </div>
          <PatientBannerPatientInfo patient={fhirMappedPatient} />
          <div>
            {isMPIPatient && (
              <div>
                <Button
                  kind="ghost"
                  renderIcon={UserFollowIcon}
                  iconDescription="Create Patient Record"
                  onClick={() => handleCreatePatientRecord(patient.externalId)}
                  style={{ marginTop: '-0.25rem' }}>
                  {t('createPatientRecord', 'Create Patient Record')}
                </Button>
              </div>
            )}
          </div>
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
                  selectPatientAction: nonNavigationSelectPatientAction,
                  launchPatientChart: true,
                }}
                patient={fhirMappedPatient}
                patientUuid={patientUuid}
              />
            ) : null}
            {!isDeceased && !currentVisit && (
              <ExtensionSlot
                name="start-visit-button-slot"
                state={{
                  handleReturnToSearchList,
                  hidePatientSearch,
                  patientUuid,
                  showPatientSearch,
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

const ClickablePatientContainer = ({ patientUuid, children }: ClickablePatientContainerProps) => {
  const { nonNavigationSelectPatientAction, patientClickSideEffect } = usePatientSearchContext();
  const config = useConfig<PatientSearchConfig>();

  const handleClick = useCallback(() => {
    nonNavigationSelectPatientAction(patientUuid);
    patientClickSideEffect?.(patientUuid);
  }, [nonNavigationSelectPatientAction, patientClickSideEffect, patientUuid]);

  const handleBeforeNavigate = useCallback(() => {
    patientClickSideEffect?.(patientUuid);
  }, [patientClickSideEffect, patientUuid]);

  if (nonNavigationSelectPatientAction) {
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
  } else {
    return (
      <ConfigurableLink
        className={styles.patientBanner}
        onBeforeNavigate={handleBeforeNavigate}
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
