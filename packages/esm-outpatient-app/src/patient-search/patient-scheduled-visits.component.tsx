import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Switch,
  ContentSwitcher,
  RadioTile,
  TileGroup,
  DataTableSkeleton,
} from 'carbon-components-react';
import ArrowLeft24 from '@carbon/icons-react/es/arrow--left/24';
import { formatDatetime, useLayoutType, parseDate } from '@openmrs/esm-framework';
import { SearchTypes } from '../types';
import styles from './patient-scheduled-visits.scss';
import { useRecentScheduledVisits, useFutureScheduledVisits } from './hooks/useScheduledVisits';
interface PatientSearchProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
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

const ScheduledVisits: React.FC<{ visits; isLoading; visitType }> = ({ visits, isLoading, visitType }) => {
  const { t } = useTranslation();
  const [prioritySwitcherValue, setSwitcherValue] = useState(0);
  const [visitsIndex, setVisitsIndex] = useState(0);
  const [show_priority, setShowPriority] = useState(false);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (visits) {
    return (
      <div>
        {visits.length >= 1 ? (
          <div className={styles.row}>
            <p className={styles.heading}>{t('futureScheduledVisits', { count: visits.length })} </p>
            <TileGroup name="tile-group" defaultSelected="default-selected">
              {visits.map((visit, ind) => (
                <RadioTile
                  value={visit.id}
                  key={visit.id}
                  className={styles.visitTile}
                  onClick={() => {
                    setShowPriority(true);
                    setVisitsIndex(ind);
                  }}>
                  <div className={styles.helperText}>
                    <p className={styles.primaryText}>{visit.visit_type}</p>
                    <p className={styles.secondaryText}>
                      {' '}
                      {formatDatetime(parseDate(visit?.visit_date))} · {visit.clinic}{' '}
                    </p>

                    {show_priority && ind == visitsIndex ? (
                      <ContentSwitcher
                        size="sm"
                        className={styles.prioritySwitcher}
                        onChange={({ index }) => setSwitcherValue(index)}>
                        <Switch
                          name={priority.NOT_URGENT}
                          text={t('notUrgent', 'Not Urgent')}
                          value={prioritySwitcherValue}
                        />
                        <Switch
                          name={priority.PRIORITY}
                          text={t('priority', 'Priority')}
                          value={prioritySwitcherValue}
                        />
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
          </div>
        ) : (
          '--'
        )}
      </div>
    );
  }
};

const PatientScheduledVisits: React.FC<PatientSearchProps> = ({ toggleSearchType, patientUuid }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const { recentVisits, isLoading } = useRecentScheduledVisits(patientUuid);
  const { futureVisits, loading } = useFutureScheduledVisits(patientUuid);

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Button
          kind="ghost"
          renderIcon={ArrowLeft24}
          iconDescription="Back to search results"
          size="sm"
          onClick={() => toggleSearchType(SearchTypes.BASIC)}>
          <span>{t('backToSearchResults', 'Back to search results')}</span>
        </Button>
      </div>

      <ScheduledVisits visitType={visitType.RECENT} visits={recentVisits} isLoading={isLoading} />
      <ScheduledVisits visitType={visitType.FUTURE} visits={futureVisits} isLoading={loading} />

      <div className={styles['text-divider']}>{t('or', 'Or')}</div>

      <div className={styles.buttonContainer}>
        <Button kind="ghost" iconDescription="Start another visit type">
          {t('anotherVisitType', 'Start another visit type')}
        </Button>
      </div>

      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => toggleSearchType(SearchTypes.BASIC)}>
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
