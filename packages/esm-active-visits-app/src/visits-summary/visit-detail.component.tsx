import React, { useMemo, useState } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { ContentSwitcher, DataTableSkeleton, Switch } from '@carbon/react';
import { type Encounter, useVisit } from './visit.resource';
import { formatTime, formatDatetime, parseDate } from '@openmrs/esm-framework';
import EncounterList from './visits-components/encounter-list.component';
import VisitSummary from './visits-components/visit-summary.component';
import styles from './visit-detail-overview.scss';

interface VisitDetailComponentProps {
  visitUuid: string;
  patientUuid: string;
}

const VisitDetailComponent: React.FC<VisitDetailComponentProps> = ({ visitUuid, patientUuid }) => {
  const { t } = useTranslation();
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(0);
  const { visit, isLoading } = useVisit(visitUuid);

  const encounters = useMemo(
    () =>
      visit
        ? visit?.encounters?.map((encounter: Encounter) => ({
            id: encounter.uuid,
            time: formatTime(parseDate(encounter.encounterDateTime)),
            encounterType: encounter.encounterType.display,
            provider: encounter.encounterProviders.length > 0 ? encounter.encounterProviders[0].display : '',
            obs: encounter.obs,
          }))
        : [],
    [visit],
  );

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }
  if (visit) {
    return (
      <div className={styles.visitsDetailWidgetContainer}>
        <div className={styles.visitsDetailHeaderContainer}>
          <h4 className={styles.productiveHeading02}>
            {visit?.visitType?.display}
            <br />
            <p className={classNames(styles.bodyLong01, styles.text02)}>
              {formatDatetime(parseDate(visit?.startDatetime))}
            </p>
          </h4>
          <div className={styles.actions}>
            <ContentSwitcher
              className={styles.contentSwitcher}
              selectedIndex={contentSwitcherIndex}
              onChange={({ index }) => setContentSwitcherIndex(index)}>
              <Switch name="allEncounters" text={t('allEncounters', 'All Encounters')} />
              <Switch name="visitSummary" text={t('visitSummary', 'Visit Summary')} />
            </ContentSwitcher>
          </div>
        </div>
        {contentSwitcherIndex === 0 && visit?.encounters && (
          <EncounterList visitUuid={visit.uuid} encounters={encounters} />
        )}
        {contentSwitcherIndex === 1 && <VisitSummary encounters={visit.encounters} patientUuid={patientUuid} />}
      </div>
    );
  } else {
    return (
      <div className={styles.visitEmptyState}>
        <h4 className={styles.productiveHeading02}>{t('noVisitsFound', 'No visits found')}</h4>
        <p className={classNames(styles.bodyLong01, styles.text02)}>
          {t('thereIsNoInformationToDisplayHere', 'There is no information to display here')}
        </p>
      </div>
    );
  }
};

export default VisitDetailComponent;
