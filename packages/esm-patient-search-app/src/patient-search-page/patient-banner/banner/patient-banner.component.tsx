import React, { useContext, useCallback, useState, useMemo } from 'react';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
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
} from '@openmrs/esm-framework';
import { type PatientSearchConfig } from '../../../config-schema';
import { type FHIRPatientType, type SearchedPatient } from '../../../types';
import { PatientSearchContext } from '../../../patient-search-context';
import styles from './patient-banner.scss';

interface ClickablePatientContainerProps {
  children: React.ReactNode;
  patientUuid: string;
}

interface PatientBannerProps {
  patient: SearchedPatient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
}

const getGender = (gender: string) => {
  switch (gender) {
    case 'M':
      return 'male';
    case 'F':
      return 'female';
    case 'O':
      return 'other';
    case 'U':
      return 'unknown';
    default:
      return gender;
  }
};

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid, hideActionsOverflow }) => {
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const { currentVisit } = useVisit(patientUuid);
  const { nonNavigationSelectPatientAction } = useContext(PatientSearchContext);
  const patientName = patient.person.personName.display;
  const isDeceased = !!patient.person.deathDate;

  const [showContactDetails, setShowContactDetails] = useState(false);

  const handleToggleContactDetails = useCallback(() => {
    setShowContactDetails((value) => !value);
  }, []);

  const fhirMappedPatient: FHIRPatientType = useMemo(() => {
    const preferredAddress = patient.person.addresses?.find((address) => address.preferred);
    const addressId = uuidv4();
    const nameId = uuidv4();

    return {
      address: preferredAddress
        ? [
            {
              id: addressId,
              city: preferredAddress.cityVillage,
              country: preferredAddress.country,
              postalCode: preferredAddress.postalCode,
              state: preferredAddress.stateProvince,
              use: 'home',
            },
          ]
        : [],
      birthDate: patient.person.birthdate,
      deceasedBoolean: patient.person.dead,
      deceasedDateTime: patient.person.deathDate,
      gender: getGender(patient.person.gender),
      id: patient.uuid,
      identifier: patient.identifiers.map((identifier) => ({
        id: identifier.uuid,
        type: {
          coding: [
            {
              code: identifier.identifierType.uuid,
            },
          ],
          text: identifier.identifierType.display,
        },
        use: 'official',
        value: identifier.identifier,
      })),
      name: [
        {
          family: patient.person.personName.familyName,
          given: [patient.person.personName.givenName, patient.person.personName.middleName],
          id: nameId,
          text: patient.person.personName.display,
        },
      ],
      telecom: patient.attributes?.filter((attribute) => attribute.attributeType.display === 'Telephone Number'),
    };
  }, [patient]);

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
                  selectPatientAction: nonNavigationSelectPatientAction,
                  launchPatientChart: true,
                }}
                isDeceased={patient.person.dead}
                patient={fhirMappedPatient}
                patientUuid={patientUuid}
              />
            ) : null}
            {!isDeceased && !currentVisit && (
              <ExtensionSlot
                name="start-visit-button-slot"
                state={{
                  patientUuid,
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
  const { nonNavigationSelectPatientAction, patientClickSideEffect } = useContext(PatientSearchContext);
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
