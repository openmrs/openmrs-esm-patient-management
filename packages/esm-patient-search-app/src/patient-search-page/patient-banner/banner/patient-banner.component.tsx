import React, { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton, SkeletonIcon, SkeletonText } from '@carbon/react';
import { ChevronDown, ChevronUp, OverflowMenuVertical } from '@carbon/react/icons';
import {
  ExtensionSlot,
  age,
  formatDate,
  parseDate,
  useVisit,
  interpolateString,
  useConfig,
  ConfigurableLink,
} from '@openmrs/esm-framework';
import { SearchedPatient } from '../../../types';
import ContactDetails from '../contact-details/contact-details.component';
import CustomOverflowMenuComponent from '../ui-components/overflow-menu.component';
import styles from './patient-banner.scss';

interface PatientBannerProps {
  patient: SearchedPatient;
  patientUuid: string;
  onTransition?: () => void;
  hideActionsOverflow?: boolean;
  selectPatientAction: (evt: any, patientUuid: string) => void;
}

const PatientBanner: React.FC<PatientBannerProps> = ({
  patient,
  patientUuid,
  onTransition,
  hideActionsOverflow,
  selectPatientAction,
}) => {
  const { t } = useTranslation();
  const overflowMenuRef = React.useRef(null);
  const showContactDetailsRef = React.useRef(null);
  const startVisitButtonRef = React.useRef(null);
  const { currentVisit } = useVisit(patientUuid);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const config = useConfig();

  const patientActionsSlotState = React.useMemo(
    () => ({ patientUuid, selectPatientAction, onTransition, launchPatientChart: true }),
    [patientUuid, selectPatientAction, onTransition],
  );

  const patientName = patient.person.personName.display;
  const patientPhotoSlotState = React.useMemo(() => ({ patientUuid, patientName }), [patientUuid, patientName]);

  const [showContactDetails, setShowContactDetails] = React.useState(false);
  const toggleContactDetails = React.useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setShowContactDetails((value) => !value);
  }, []);

  const patientAvatar = (
    <div className={styles.patientAvatar} role="img">
      <ExtensionSlot extensionSlotName="patient-photo-slot" state={patientPhotoSlotState} />
    </div>
  );

  const closeDropdownMenu = React.useCallback((event: MouseEvent) => {
    event.stopPropagation();
    setShowDropdown((value) => !value);
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
        className={`${styles.container} ${
          isDeceased ? styles.deceasedPatientContainer : styles.activePatientContainer
        }`}
        role="banner">
        <ConfigurableLink
          to={`${interpolateString(config.search.patientResultUrl, {
            patientUuid: patientUuid,
          })}`}
          onClick={(evt) => selectPatientAction(evt, patientUuid)}
          className={`${styles.patientBanner} ${selectPatientAction && styles.patientAvatarButton}`}>
          {patientAvatar}
          <div className={`${styles.patientNameRow} ${styles.patientInfo}`}>
            <div className={styles.flexRow}>
              <span className={styles.patientName}>{patientName}</span>
              <ExtensionSlot
                extensionSlotName="patient-banner-tags-slot"
                state={{ patientUuid, patient: fhirPatient }}
                className={styles.flexRow}
              />
            </div>
            <div className={styles.demographics}>
              <span>{getGender(patient.person.gender)}</span> &middot; <span>{age(patient.person.birthdate)}</span>{' '}
              &middot; <span>{formatDate(parseDate(patient.person.birthdate), { mode: 'wide', time: false })}</span>
            </div>
            <div className={styles.identifiers}>
              {patient.identifiers?.length ? patient.identifiers.map((i) => i.identifier).join(', ') : '--'}
            </div>
          </div>
        </ConfigurableLink>
        <div className={styles.buttonCol}>
          {!hideActionsOverflow && (
            <div className={styles.overflowMenuContainer} ref={overflowMenuRef}>
              <CustomOverflowMenuComponent
                isDeceased={isDeceased}
                menuTitle={
                  <>
                    <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                    <OverflowMenuVertical className={styles.menu} size={16} />
                  </>
                }
                dropDownMenu={showDropdown}>
                <ExtensionSlot
                  onClick={closeDropdownMenu}
                  extensionSlotName="patient-search-actions-slot"
                  state={patientActionsSlotState}
                />
              </CustomOverflowMenuComponent>
            </div>
          )}
          {!isDeceased &&
            (!currentVisit ? (
              <ExtensionSlot
                extensionSlotName="start-visit-button-slot"
                state={{
                  patientUuid,
                }}
              />
            ) : (
              <Button
                ref={showContactDetailsRef}
                kind="ghost"
                renderIcon={showContactDetails ? ChevronUp : ChevronDown}
                iconDescription="Toggle contact details"
                onClick={toggleContactDetails}
                style={{ marginTop: '-0.25rem' }}>
                {showContactDetails ? t('showLess', 'Show less') : t('showAllDetails', 'Show all details')}
              </Button>
            ))}
        </div>
      </div>
      {showContactDetails && <ContactDetails address={patient.person.addresses} patientId={patient.uuid} />}
    </>
  );
};

export const PatientBannerSkeleton = () => {
  return (
    <div className={styles.container} role="banner">
      <div className={styles.patientBanner}>
        <SkeletonIcon className={styles.patientAvatar} />
        <div className={`${styles.patientNameRow} ${styles.patientInfo}`}>
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
