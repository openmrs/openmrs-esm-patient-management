import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabPanels, TabPanel, TabList } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot } from '@openmrs/esm-framework';
import PatientSearch from '../patient-search/patient-search.component';
import MissingQueueEntries from '../visits-missing-inqueue/visits-missing-inqueue.component';
import styles from './active-visits-tab.scss';
import DefaultQueueTable from '../queue-table/default-queue-table.component';

function ActiveVisitsTabs() {
  const { t } = useTranslation();
  const [showOverlay, setShowOverlay] = useState(false);
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);
  const [selectedTab, setSelectedTab] = useState(0);

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
              setViewState({ selectedPatientUuid });
            },
          }}
        />
      </div>
      <Tabs selectedIndex={selectedTab} onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}>
        <TabList style={{ paddingLeft: '1rem' }} aria-label="Outpatient tabs" contained>
          <Tab>{t('InQueue', 'In Queue')}</Tab>
          <Tab>{t('NotInQueue', 'Not In Queue')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel style={{ padding: 0 }}>
            <DefaultQueueTable />
          </TabPanel>
          <TabPanel style={{ padding: 0 }}>
            <MissingQueueEntries />
          </TabPanel>
        </TabPanels>
      </Tabs>
      {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} viewState={viewState} />}
    </div>
  );
}

export default ActiveVisitsTabs;
