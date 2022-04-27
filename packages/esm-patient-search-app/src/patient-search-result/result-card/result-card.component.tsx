import { age, ExtensionSlot, formatDate, navigate, parseDate, useVisit } from '@openmrs/esm-framework';
import { Button, ClickableTile } from 'carbon-components-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './result-card.scss';
import ChevronDown16 from '@carbon/icons-react/es/chevron--down/16';
import ChevronUp16 from '@carbon/icons-react/es/chevron--up/16';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import capitalize from 'lodash-es/capitalize';
import CustomOverflowMenuComponent from './overflow-menu.component';
import ContactDetails from '../contact-details.component';

interface ResultCardProp {
  patient: fhir.Patient;
  onSearchResultClick: (patientUuid: string) => void;
  closeSearchResultsPanel: () => {};
}

const ResultCard: React.FC<ResultCardProp> = ({ patient, onSearchResultClick, closeSearchResultsPanel }) => {
  const { t } = useTranslation();
  const overFlowMenuRef = React.useRef(null);
  const { currentVisit } = useVisit(patient.id);
  const shouldStartVisit = (patient.deceasedDateTime ? false : true) && currentVisit === null;
  const [showContactDetails, setShowContactDetails] = useState<boolean>(false);
  const patientName = `${patient.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const photoFrameState = useMemo(() => ({ patientUuid: patient.id, patientName }), [patient, patientName]);

  const patientGender = () => {
    if (patient.gender === 'M') {
      return t('male', 'Male');
    }
    if (patient.gender === 'F') {
      return t('female', 'Female');
    }
    return t('unknown', 'UnKnown');
  };

  const patientActionsSlotState = React.useMemo(
    () => ({ patientUuid: patient.id, onClick: onSearchResultClick, onTransition: closeSearchResultsPanel }),
    [closeSearchResultsPanel, onSearchResultClick, patient.id],
  );

  const handleNavigateToPatientChart = (event: React.MouseEvent) => {
    if (!(overFlowMenuRef?.current && overFlowMenuRef?.current.contains(event.target))) {
      onSearchResultClick(patient.id);
    } else {
      event.stopPropagation();
    }
  };

  const handleStartVisit = () => {
    navigate({ to: '${openmrsSpaBase}/patient/' + `${patient.id}/chart` });
    closeSearchResultsPanel();
  };

  const toggleShowMoreDetails = (event: React.MouseEvent) => {
    event.stopPropagation();
    setShowContactDetails((prevState) => !prevState);
  };

  return (
    <ClickableTile className={styles.clickableTile} onClick={handleNavigateToPatientChart}>
      <div className={styles.patientInfo}>
        <div className={styles.photoFrame}>
          <ExtensionSlot extensionSlotName="patient-photo-slot" state={photoFrameState} />
        </div>
        <div className={styles.patientDetails}>
          <span className={styles.patientName}>
            {capitalize(patientName)}{' '}
            <ExtensionSlot
              extensionSlotName="patient-banner-tags-slot"
              state={{ patientUuid: patient.id, patient }}
              className={styles.flexRow}
            />
          </span>
          <div className={styles.patientGender}>
            {patientGender()} &middot; &nbsp;
            {age(patient.birthDate)} &middot;
            {formatDate(parseDate(patient.birthDate), { mode: 'wide', time: false })}
          </div>
          <div className={styles.row}>
            <div className={styles.identifier}>
              {patient.identifier.length ? patient.identifier.map((identifier) => identifier.value).join(', ') : '--'}
            </div>
          </div>
        </div>
        <div className={styles.action}>
          <div ref={overFlowMenuRef}>
            <CustomOverflowMenuComponent
              menuTitle={
                <>
                  <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                  <OverflowMenuVertical16 style={{ marginLeft: '0.5rem' }} />
                </>
              }>
              <ExtensionSlot
                extensionSlotName="patient-actions-slot"
                key="patient-actions-slot"
                className={styles.overflowMenuItemList}
                state={patientActionsSlotState}
              />
            </CustomOverflowMenuComponent>
          </div>

          {shouldStartVisit ? (
            <Button onClick={handleStartVisit} iconDescription={t('startVisit', 'Start visit')}>
              {t('startVisit', 'Start visit')}
            </Button>
          ) : (
            <Button
              kind="ghost"
              renderIcon={showContactDetails ? ChevronUp16 : ChevronDown16}
              iconDescription="Toggle contact details"
              onClick={toggleShowMoreDetails}>
              {showContactDetails ? t('showLess', 'Show less') : t('showAllDetails', 'Show all details')}
            </Button>
          )}
        </div>
      </div>
      {showContactDetails && (
        <ContactDetails address={patient.address} patientId={patient.id} contact={patient.contact} />
      )}
    </ClickableTile>
  );
};

export default ResultCard;
