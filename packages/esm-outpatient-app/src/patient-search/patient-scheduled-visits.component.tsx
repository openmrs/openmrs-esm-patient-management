import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonSet, Switch, ContentSwitcher, RadioTile, TileGroup } from 'carbon-components-react';
import ArrowLeft24 from '@carbon/icons-react/es/arrow--left/24';
import { formatDatetime, useLayoutType, parseDate } from '@openmrs/esm-framework';
import { SearchTypes } from '../types';
import styles from './patient-scheduled-visits.scss';

interface PatientSearchProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
}

enum priority {
  NOT_URGENT = 'Not urgent',
  PRIORITY = 'Priority',
  EMERGENCY = 'Emergency',
}

const PatientScheduledVisits: React.FC<PatientSearchProps> = ({ toggleSearchType }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [showRecentPriority, setShowRecentPriority] = useState(false);
  const [futurePrioritySwitcherValue, setFuturePrioritySwitcherValue] = useState(0);
  const [futureVisitsIndex, setFutureVisitsIndex] = useState(0);

  const [show_future_priority, setShowFuturePriority] = useState(false);
  const [recentPrioritySwitcherValue, setRecentPrioritySwitcherValue] = useState(0);
  const [recentVisitsIndex, setRecentVisitsIndex] = useState(0);

  const recentVisits = [
    {
      id: '1',
      visit_type: 'Adult diabetes return visit',
      clinic: 'NCD clinic',
      visit_date: '2022-02-23T22:44:32.000+0000',
    },
    {
      id: '2',
      visit_type: 'Adult HIV return visit',
      clinic: 'HIV clinic',
      visit_date: '2022-02-23T22:44:32.000+0000',
    },
    {
      id: '3',
      visit_type: 'Adult HIV return visit',
      clinic: 'HIV clinic',
      visit_date: '2022-02-23T22:44:32.000+0000',
    },
  ];

  const futureVisits = [
    {
      id: '1',
      visit_type: 'Adult HIV return visit',
      clinic: 'HIV clinic',
      visit_date: '2022-02-23T22:44:32.000+0000',
    },
  ];

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

      <div className={styles.row}>
        <p className={styles.heading}>{t('recentScheduledVisits', { count: recentVisits.length })} </p>
        <TileGroup name="tile-group" defaultSelected="forever" className="trigger-tile">
          {recentVisits.map((visit, index) => (
            <RadioTile
              id={visit.id}
              value={visit.id}
              key={visit.id}
              className={styles.visitTile}
              onClick={() => {
                setShowRecentPriority(true);
                setRecentVisitsIndex(index);
              }}>
              <div className={styles.helperText}>
                <p className={styles.primaryText}>{visit.visit_type}</p>
                <p className={styles.secondaryText}>
                  {' '}
                  {formatDatetime(parseDate(visit?.visit_date))} · {visit.clinic}{' '}
                </p>
                {showRecentPriority && index == recentVisitsIndex ? (
                  <ContentSwitcher
                    size="sm"
                    className={styles.prioritySwitcher}
                    onChange={({ index }) => {
                      setRecentPrioritySwitcherValue(index);
                    }}>
                    <Switch
                      name={priority.NOT_URGENT}
                      text={t('notUrgent', 'Not Urgent')}
                      value={recentPrioritySwitcherValue}
                    />
                    <Switch
                      name={priority.PRIORITY}
                      text={t('priority', 'Priority')}
                      value={recentPrioritySwitcherValue}
                    />
                    <Switch
                      name={priority.EMERGENCY}
                      text={t('emergency', 'Emergency')}
                      value={recentPrioritySwitcherValue}
                    />
                  </ContentSwitcher>
                ) : null}
              </div>
            </RadioTile>
          ))}
        </TileGroup>
      </div>

      <div className={styles.row}>
        <p className={styles.heading}>{t('futureScheduledVisits', { count: futureVisits.length })} </p>
        <TileGroup name="tile-group" defaultSelected="default-selected">
          {futureVisits.map((visit, ind) => (
            <RadioTile
              value={visit.id}
              key={visit.id}
              className={styles.visitTile}
              onClick={() => {
                setShowFuturePriority(true);
                setFutureVisitsIndex(ind);
              }}>
              <div className={styles.helperText}>
                <p className={styles.primaryText}>{visit.visit_type}</p>
                <p className={styles.secondaryText}>
                  {' '}
                  {formatDatetime(parseDate(visit?.visit_date))} · {visit.clinic}{' '}
                </p>

                {show_future_priority && ind == futureVisitsIndex ? (
                  <ContentSwitcher
                    size="sm"
                    className={styles.prioritySwitcher}
                    onChange={({ index }) => setFuturePrioritySwitcherValue(index)}>
                    <Switch
                      name={priority.NOT_URGENT}
                      text={t('notUrgent', 'Not Urgent')}
                      value={futurePrioritySwitcherValue}
                    />
                    <Switch
                      name={priority.PRIORITY}
                      text={t('priority', 'Priority')}
                      value={futurePrioritySwitcherValue}
                    />
                    <Switch
                      name={priority.EMERGENCY}
                      text={t('emergency', 'Emergency')}
                      value={futurePrioritySwitcherValue}
                    />
                  </ContentSwitcher>
                ) : null}
              </div>
            </RadioTile>
          ))}
        </TileGroup>
      </div>
      <div className={styles['text-divider']}>{t('or', 'Or')}</div>

      <div className={styles.buttonContainer}>
        <Button
          kind="ghost"
          iconDescription="Start another visit type"
          onClick={() => toggleSearchType(SearchTypes.VISIT_FORM)}>
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
