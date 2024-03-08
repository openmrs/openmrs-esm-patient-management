import React, { type MouseEvent, useContext } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton, SkeletonIcon, SkeletonText } from '@carbon/react';
import { ChevronDown, ChevronUp } from '@carbon/react/icons';
import {
  ExtensionSlot,
  age,
  formatDate,
  parseDate,
  useVisit,
  useConfig,
  ConfigurableLink,
  PatientPhoto,
  PatientBannerActionsMenu,
} from '@openmrs/esm-framework';
import { type SearchedPatient } from '../../../types';
import ContactDetails from '../contact-details/contact-details.component';
import styles from './patient-banner.scss';
import { PatientSearchContext } from '../../../patient-search-context';

interface PatientBannerProps {
  patient: SearchedPatient;
  patientUuid: string;
  hideActionsOverflow?: boolean;
}

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid, hideActionsOverflow }) => {
  const { t } = useTranslation();
  const { currentVisit } = useVisit(patientUuid);
  const { nonNavigationSelectPatientAction } = useContext(PatientSearchContext);

  const patientName = patient.person.personName.display;

  const [showContactDetails, setShowContactDetails] = React.useState(false);
  const toggleContactDetails = React.useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setShowContactDetails((value) => !value);
  }, []);

  const getGender = (gender) => {
    switch (gender) {
      case 'M':
        return t('male', 'Male');
      case 'F':
        return t('female', 'Female');
      case 'O':
        return t('other', 'Other');
      case 'U':
        return t('unknown', 'Unknown');
      default:
        return gender;
    }
  };

  const isDeceased = !!patient.person.deathDate;

  const fhirPatient = React.useMemo(() => {
    return {
      deceasedDateTime: patient.person.deathDate,
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
            <PatientPhoto patientUuid={patientUuid} patientName={patientName} size="small" />
          </div>
          {/* TODO: Replace this section with PatientBannerPatientInfo once the `patient` object is
              changed from SearchedPatient type to fhir.Patient type */}
          <div className={classNames(styles.patientNameRow, styles.patientInfo)}>
            <div className={styles.flexRow}>
              <span className={styles.patientName}>{patientName}</span>
              <ExtensionSlot
                name="patient-banner-tags-slot"
                state={{ patientUuid, patient: fhirPatient }}
                className={styles.flexRow}
              />
            </div>
            <div className={styles.demographics}>
              <span>{getGender(patient.person.gender)}</span> &middot; <span>{age(patient.person.birthdate)}</span>{' '}
              &middot; <span>{formatDate(parseDate(patient.person.birthdate), { mode: 'wide', time: false })}</span>
            </div>
            <div>
              <div className={styles.identifiers}>
                {patient.identifiers?.length ? patient.identifiers.map((i) => i.identifier).join(', ') : '--'}
              </div>
            </div>
          </div>
          <Button
            className={styles.toggleContactDetailsButton}
            kind="ghost"
            renderIcon={showContactDetails ? ChevronUp : ChevronDown}
            iconDescription="Toggle contact details"
            onClick={toggleContactDetails}
            style={{ marginTop: '-0.25rem' }}>
            {showContactDetails ? t('hideDetails', 'Hide details') : t('showDetails', 'Show details')}
          </Button>
        </ClickablePatientContainer>
        <div className={styles.buttonCol}>
          {!hideActionsOverflow ? (
            <PatientBannerActionsMenu
              patientUuid={patientUuid}
              actionsSlotName={'patient-search-actions-slot'}
              additionalActionsSlotState={{
                selectPatientAction: nonNavigationSelectPatientAction,
                launchPatientChart: true,
              }}
              isDeceased={patient.person.dead}
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
      {showContactDetails && <ContactDetails patientId={patient.uuid} deceased={isDeceased} />}
    </>
  );
};

interface ClickablePatientContainerProps {
  patientUuid: string;
  children: React.ReactNode;
}

const ClickablePatientContainer = ({ patientUuid, children }: ClickablePatientContainerProps) => {
  const { nonNavigationSelectPatientAction, patientClickSideEffect } = useContext(PatientSearchContext);
  const config = useConfig();

  if (nonNavigationSelectPatientAction) {
    return (
      <button
        className={classNames(styles.patientBannerButton, styles.patientBanner, {
          [styles.patientAvatarButton]: nonNavigationSelectPatientAction,
        })}
        key={patientUuid}
        onClick={() => {
          nonNavigationSelectPatientAction(patientUuid);
          patientClickSideEffect?.(patientUuid);
        }}>
        {children}
      </button>
    );
  } else {
    return (
      <ConfigurableLink
        className={styles.patientBanner}
        onBeforeNavigate={() => patientClickSideEffect?.(patientUuid)}
        to={config.search.patientResultUrl}
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
          <div className={styles.demographics}>
            <SkeletonIcon />
            &middot;
            <SkeletonIcon />
            &middot;
            <SkeletonIcon />
          </div>
          <div className={styles.identifiers}>
            <SkeletonText />
          </div>
        </div>
      </div>
      <div className={styles.buttonCol}>
        <ButtonSkeleton />
        <ButtonSkeleton />
      </div>
    </div>
  );
};

export default PatientBanner;
