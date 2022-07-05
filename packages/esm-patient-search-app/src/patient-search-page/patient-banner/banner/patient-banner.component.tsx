import React, { MouseEvent } from 'react';
import capitalize from 'lodash-es/capitalize';
import ChevronDown16 from '@carbon/icons-react/es/chevron--down/16';
import ChevronUp16 from '@carbon/icons-react/es/chevron--up/16';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import ContactDetails from '../contact-details/contact-details.component';
import CustomOverflowMenuComponent from '../ui-components/overflow-menu.component';
import styles from './patient-banner.scss';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSkeleton, SkeletonIcon, SkeletonText } from 'carbon-components-react';
import {
  ExtensionSlot,
  age,
  formatDate,
  parseDate,
  useVisit,
  navigate,
  interpolateString,
  useConfig,
  ConfigurableLink,
} from '@openmrs/esm-framework';
import { FHIRPatientType } from '../../../patient-search.resource';
import {} from 'single-spa';

interface PatientBannerProps {
  patient: FHIRPatientType;
  patientUuid: string;
  onTransition?: () => void;
  hideActionsOverflow?: boolean;
}

const PatientBanner: React.FC<PatientBannerProps> = ({ patient, patientUuid, onTransition, hideActionsOverflow }) => {
  const { t } = useTranslation();
  const overFlowMenuRef = React.useRef(null);
  const showContactDetailsRef = React.useRef(null);
  const startVisitButtonRef = React.useRef(null);
  const { currentVisit } = useVisit(patientUuid);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const config = useConfig();

  const handleClick = () => {
    navigate({
      to: interpolateString(config.search.patientResultUrl, {
        patientUuid: patientUuid,
      }),
    });
  };

  const patientActionsSlotState = React.useMemo(
    () => ({ patientUuid, handleClick, onTransition }),
    [patientUuid, handleClick, onTransition],
  );

  const patientName = `${patient.name?.[0].given.join(' ')} ${patient.name?.[0].family}`;
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

  const handleNavigateToPatientChart = (event: MouseEvent) => {
    event.preventDefault();
    if (
      handleClick &&
      !(overFlowMenuRef?.current && overFlowMenuRef?.current.contains(event.target)) &&
      !(showContactDetailsRef?.current && showContactDetailsRef?.current.contains(event.target)) &&
      !(startVisitButtonRef?.current && startVisitButtonRef?.current.contains(event.target))
    ) {
      handleClick();
    }
  };
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

  return (
    <>
      <div className={styles.container} role="banner">
        <ConfigurableLink
          to={interpolateString(config.search.patientResultUrl, {
            patientUuid: patientUuid,
          })}
          onClick={(evt) => handleNavigateToPatientChart(evt)}
          className={`${styles.patientBanner} ${handleClick && styles.patientAvatarButton}`}>
          {patientAvatar}
          <div className={`${styles.patientNameRow} ${styles.patientInfo}`}>
            <div className={styles.flexRow}>
              <span className={styles.patientName}>{patientName}</span>
              <ExtensionSlot
                extensionSlotName="patient-banner-tags-slot"
                state={{ patientUuid, patient }}
                className={styles.flexRow}
              />
            </div>
            <div className={styles.demographics}>
              <span>{getGender(patient.gender)}</span> &middot; <span>{age(patient.birthDate)}</span> &middot;{' '}
              <span>{formatDate(parseDate(patient.birthDate), { mode: 'wide', time: false })}</span>
            </div>
            <div className={styles.identifiers}>
              {patient.identifier?.length ? patient.identifier.map((i) => i.value).join(', ') : '--'}
            </div>
          </div>
        </ConfigurableLink>
        <div className={styles.buttonCol}>
          {!hideActionsOverflow && (
            <div ref={overFlowMenuRef}>
              <CustomOverflowMenuComponent
                menuTitle={
                  <>
                    <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                    <OverflowMenuVertical16 style={{ marginLeft: '0.5rem' }} />
                  </>
                }
                dropDownMenu={showDropdown}>
                <ExtensionSlot
                  onClick={closeDropdownMenu}
                  extensionSlotName="patient-actions-slot"
                  key="patient-actions-slot"
                  className={styles.overflowMenuItemList}
                  state={patientActionsSlotState}
                />
              </CustomOverflowMenuComponent>
            </div>
          )}
          {!currentVisit ? (
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
              renderIcon={showContactDetails ? ChevronUp16 : ChevronDown16}
              iconDescription="Toggle contact details"
              onClick={toggleContactDetails}
              style={{ marginTop: '-0.25rem' }}>
              {showContactDetails ? t('showLess', 'Show less') : t('showAllDetails', 'Show all details')}
            </Button>
          )}
        </div>
      </div>
      {showContactDetails && <ContactDetails address={patient.address ?? []} telecom={[]} patientId={patient.id} />}
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
