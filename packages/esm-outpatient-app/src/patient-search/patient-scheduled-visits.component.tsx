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

enum tile_value {
  STANDARD = 'standard',
  SELECTED = 'default-selected',
}

const PatientScheduledVisits: React.FC<PatientSearchProps> = ({ toggleSearchType }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const [show_priority, setShowPriority] = useState(false);
  const [prioritySwitcherValue, setPrioritySwitcherValue] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [value, setValue] = useState('');

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
        <p className={styles.heading}> {recentVisits.length} visits scheduled for +/- 7 days </p>
        {recentVisits.map((visit, index) => (
          <TileGroup name="tile-group" defaultSelected="default-selected">
            <RadioTile
              value={tile_value.STANDARD}
              key={index}
              className={styles.visitTile}
              onClick={() => {
                setShowPriority(true);
                setSelectedIndex(index);
                setValue(tile_value.SELECTED);
              }}>
              <div className={styles.helperText}>
                <p className={styles.primaryText}>{visit.visit_type}</p>
                <p className={styles.secondaryText}>
                  {' '}
                  {formatDatetime(parseDate(visit?.visit_date))} · {visit.clinic}{' '}
                </p>

                {show_priority && index == selectedIndex ? (
                  <ContentSwitcher
                    size="sm"
                    className={styles.prioritySwitcher}
                    onChange={({ index }) => setPrioritySwitcherValue(index)}>
                    <Switch name={priority.NOT_URGENT} text={t('notUrgent', 'Not Urgent')} />
                    <Switch name={priority.PRIORITY} text={t('priority', 'Priority')} />
                    <Switch name={priority.EMERGENCY} text={t('emergency', 'Emergency')} />
                  </ContentSwitcher>
                ) : null}
              </div>
            </RadioTile>
          </TileGroup>
        ))}
      </div>

      <div className={styles.row}>
        <p className={styles.heading}> {futureVisits.length} visits scheduled for dates in the future </p>
        {futureVisits.map((visit, index) => (
          <TileGroup name="tile-group" defaultSelected="default-selected">
            <RadioTile
              value={tile_value.STANDARD}
              key={index}
              className={styles.visitTile}
              onClick={() => {
                setShowPriority(true);
                setSelectedIndex(index);
                setValue(tile_value.SELECTED);
              }}>
              <div className={styles.helperText}>
                <p className={styles.primaryText}>{visit.visit_type}</p>
                <p className={styles.secondaryText}>
                  {' '}
                  {formatDatetime(parseDate(visit?.visit_date))} · {visit.clinic}{' '}
                </p>

                {show_priority && index == selectedIndex ? (
                  <ContentSwitcher
                    size="sm"
                    className={styles.prioritySwitcher}
                    onChange={({ index }) => setPrioritySwitcherValue(index)}>
                    <Switch name={priority.NOT_URGENT} text={t('notUrgent', 'Not Urgent')} />
                    <Switch name={priority.PRIORITY} text={t('priority', 'Priority')} />
                    <Switch name={priority.EMERGENCY} text={t('emergency', 'Emergency')} />
                  </ContentSwitcher>
                ) : null}
              </div>
            </RadioTile>
          </TileGroup>
        ))}
      </div>

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
