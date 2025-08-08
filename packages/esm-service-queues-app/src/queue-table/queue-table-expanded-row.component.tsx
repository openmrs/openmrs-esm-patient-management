import React, { type FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabPanels, TabPanel, TabList } from '@carbon/react';
import CurrentVisit from '../current-visit/current-visit-summary.component';
import PastVisit from '../past-visit/past-visit.component';
import { type QueueEntry } from '../types';
import styles from './queue-table-expanded-row.scss';

const QueueTableExpandedRow: FC<{ queueEntry: QueueEntry }> = ({ queueEntry }) => {
  const { t } = useTranslation();
  return (
    <Tabs>
      <TabList aria-label={t('visitTabs', 'Visit tabs')} className={styles.tabList}>
        <Tab className={styles.tab}>{t('currentVisit', 'Current visit')}</Tab>
        <Tab className={styles.tab}>{t('previousVisit', 'Previous visit')} </Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <CurrentVisit patientUuid={queueEntry.patient.uuid} visitUuid={queueEntry.visit.uuid} />
        </TabPanel>
        <TabPanel>
          <PastVisit patientUuid={queueEntry.patient.uuid} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default QueueTableExpandedRow;
