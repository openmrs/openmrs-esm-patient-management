import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabPanels, TabPanel, TabList } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { SearchTypes } from '../types';
import PatientSearch from '../patient-search/patient-search.component';
import MissingQueueEntries from '../visits-missing-inqueue/visits-missing-inqueue.component';
import ActiveVisitsTable from './active-visits-table.component';
import styles from './active-visits-table.scss';

function ActiveVisitsTabs() {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(false);
  const [view, setView] = useState('');
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [overlayHeader, setOverlayTitle] = useState('');

  return (
    <div className={styles.container} data-testid="active-visits-tabs">
      <div className={styles.headerBtnContainer}>
        <ExtensionSlot
          name="patient-search-button-slot"
          state={{
            buttonText: t('addPatientToQueue', 'Add patient to queue'),
            overlayHeader: t('addPatientToQueue', 'Add patient to queue'),
            buttonProps: {
              kind: 'secondary',
              renderIcon: (props) => <Add size={16} {...props} />,
              size: 'sm',
            },
            selectPatientAction: (selectedPatientUuid) => {
              setShowOverlay(true);
              setView(SearchTypes.SCHEDULED_VISITS);
              setViewState({ selectedPatientUuid });
              setOverlayTitle(t('addPatientToQueue', 'Add patient to queue'));
            },
          }}
        />
      </div>
      <Tabs
        selectedIndex={selectedTab}
        onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
        className={styles.tabs}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Outpatient tabs" contained>
          <Tab>{t('InQueue', 'In Queue')}</Tab>
          <Tab>{t('NotInQueue', 'Not In Queue')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel style={{ padding: 0 }}>
            <ActiveVisitsTable />
          </TabPanel>
          <TabPanel style={{ padding: 0 }}>
            <MissingQueueEntries />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {showOverlay && (
        <PatientSearch
          view={view}
          closePanel={() => setShowOverlay(false)}
          viewState={viewState}
          headerTitle={overlayHeader}
        />
      )}
    </div>
  );
}

export default ActiveVisitsTabs;
