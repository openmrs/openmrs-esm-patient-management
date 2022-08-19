import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Switch, ContentSwitcher, RadioTile, TileGroup, DataTableSkeleton } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { formatDatetime, useLayoutType, parseDate, ErrorState } from '@openmrs/esm-framework';
import { SearchTypes } from '../types';
import styles from './patient-scheduled-visits.scss';
import { useScheduledVisits } from './hooks/useScheduledVisits';
import StartVisitForm from './visit-form/visit-form.component';
import isNil from 'lodash-es/isNil';
interface PatientSearchProps {
  toggleSearchType: (searchMode: SearchTypes, patientUuid, mode) => void;
  patientUuid: string;
}

enum priority {
  NOT_URGENT = 'Not urgent',
  PRIORITY = 'Priority',
  EMERGENCY = 'Emergency',
}

enum visitType {
  RECENT = 'Recent',
  FUTURE = 'Future',
}

export const ScheduledVisits: React.FC<{ visits; visitType; scheduledVisitHeader }> = ({
  visits,
  scheduledVisitHeader,
}) => {
  const { t } = useTranslation();
  const [prioritySwitcherValue, setSwitcherValue] = useState(0);
  const [visitsIndex, setVisitsIndex] = useState(0);
  const [hasPriority, setHasPriority] = useState(false);

  if (visits) {
    return (
      <div className={styles.row}>
        <p className={styles.heading}>{scheduledVisitHeader} </p>
        {visits?.length > 0 ? (
          <TileGroup name="tile-group" defaultSelected="default-selected">
            {visits?.map((visit, ind) => (
              <RadioTile
                value={visit.uuid}
                key={visit.uuid}
                className={styles.visitTile}
                onClick={() => {
                  setHasPriority(true);
                  setVisitsIndex(ind);
                }}>
                <div className={styles.helperText}>
                  <p className={styles.primaryText}>{visit.service?.name}</p>
                  <p className={styles.secondaryText}>
                    {' '}
                    {formatDatetime(parseDate(visit?.startDateTime))} · {visit.service?.name}{' '}
                  </p>

                  {hasPriority && ind == visitsIndex ? (
                    <ContentSwitcher
                      size="sm"
                      className={styles.prioritySwitcher}
                      onChange={({ index }) => setSwitcherValue(index)}>
                      <Switch
                        name={priority.NOT_URGENT}
                        text={t('notUrgent', 'Not Urgent')}
                        value={prioritySwitcherValue}
                      />
                      <Switch name={priority.PRIORITY} text={t('priority', 'Priority')} value={prioritySwitcherValue} />
                      <Switch
                        name={priority.EMERGENCY}
                        text={t('emergency', 'Emergency')}
                        value={prioritySwitcherValue}
                      />
                    </ContentSwitcher>
                  ) : null}
                </div>
              </RadioTile>
            ))}
          </TileGroup>
        ) : (
          <div className={styles.emptyAppointment}>
            <p>{t('noAppointmentsFound', 'No appointements found')} </p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={styles.emptyAppointment}>
      <p className={styles.heading}> {scheduledVisitHeader} </p>
    </div>
  );
};

const PatientScheduledVisits: React.FC<PatientSearchProps> = ({ toggleSearchType, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { appointments, isLoading, isError } = useScheduledVisits(patientUuid, new AbortController());

  if (isError) {
    <ErrorState headerTitle={t('errorFetchingAppoinments', 'Error fetching appointments')} error={isError} />;
  }

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (isNil(appointments.futureVisits) && isNil(appointments.recentVisits)) {
    toggleSearchType(SearchTypes.VISIT_FORM, patientUuid, true);
  }

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Button
          kind="ghost"
          renderIcon={ArrowLeft}
          iconDescription="Back to search results"
          size="sm"
          onClick={() => toggleSearchType(SearchTypes.BASIC, patientUuid, false)}>
          <span>{t('backToSearchResults', 'Back to search results')}</span>
        </Button>
      </div>

      <ScheduledVisits
        visitType={visitType.RECENT}
        visits={appointments?.recentVisits}
        scheduledVisitHeader={t('recentScheduledVisits', { count: appointments?.recentVisits?.length })}
      />
      <ScheduledVisits
        visitType={visitType.FUTURE}
        visits={appointments?.futureVisits}
        scheduledVisitHeader={t('futureScheduledVisits', { count: appointments?.futureVisits?.length })}
      />

      <div className={styles['text-divider']}>{t('or', 'Or')}</div>

      <div className={styles.buttonContainer}>
        <Button
          kind="ghost"
          iconDescription="Start another visit type"
          onClick={() => toggleSearchType(SearchTypes.VISIT_FORM, patientUuid, false)}>
          {t('anotherVisitType', 'Start another visit type')}
        </Button>
      </div>

      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button
          className={styles.button}
          kind="secondary"
          onClick={() => toggleSearchType(SearchTypes.BASIC, patientUuid, false)}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('search', 'Search')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default PatientScheduledVisits;
