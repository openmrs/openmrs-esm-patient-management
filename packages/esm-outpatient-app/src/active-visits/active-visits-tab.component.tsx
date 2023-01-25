import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableSkeleton, Tab, Tabs, TabPanels, TabPanel, TabList, Tile } from '@carbon/react';
import { Add, ArrowRight } from '@carbon/react/icons';
import { ExtensionSlot, UserHasAccess } from '@openmrs/esm-framework';
import { useVisitQueueEntries } from './active-visits-table.resource';
import PatientSearch from '../patient-search/patient-search.component';
import styles from './active-visits-table.scss';
import { SearchTypes } from '../types';
import { useSelectedServiceName } from '../helpers/helpers';
import MissingQueueEntries from '../visits-missing-inqueue/visits-missing-inqueue.component';
import ActiveVisitsTabview from './active-visits-table-tabview.component';

function ActiveVisitsTabs() {
  const { t } = useTranslation();
  const currentServiceName = useSelectedServiceName();
  const { visitQueueEntries, isLoading } = useVisitQueueEntries(currentServiceName);
  const [showOverlay, setShowOverlay] = useState(false);
  const [view, setView] = useState('');
  const [viewState, setViewState] = useState<{ selectedPatientUuid: string }>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" />;
  }

  if (visitQueueEntries?.length) {
    return (
      <div className={styles.container}>
        <div className={styles.headerBtnContainer}>
          <UserHasAccess privilege="Manage Forms">
            <Button
              size="sm"
              kind="ghost"
              renderIcon={(props) => <ArrowRight size={16} {...props} />}
              onClick={() => {
                setShowOverlay(true);
                setView(SearchTypes.QUEUE_SERVICE_FORM);
              }}
              iconDescription={t('addNewQueue', 'Add new queue')}>
              {t('addNewService', 'Add new service')}
            </Button>
          </UserHasAccess>
          <ExtensionSlot
            extensionSlotName="patient-search-button-slot"
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
              },
            }}
          />
        </div>
        <Tabs
          selectedIndex={selectedTab}
          onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}
          className={styles.tabs}>
          <TabList style={{ paddingLeft: '1rem' }} aria-label="Appointment tabs" contained>
            <Tab>{t('InQueue', 'In Queue')}</Tab>
            <Tab>{t('NotInQueue', 'Not In Queue')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel style={{ padding: 0 }}>
              <ActiveVisitsTabview />
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
            viewState={{
              selectedPatientUuid: viewState.selectedPatientUuid,
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerBtnContainer}>
        <Button
          size="sm"
          kind="ghost"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          onClick={(selectedPatientUuid) => {
            setShowOverlay(true);
            setView(SearchTypes.QUEUE_SERVICE_FORM);
            setViewState({ selectedPatientUuid });
          }}
          iconDescription={t('addNewQueue', 'Add new queue')}>
          {t('addNewService', 'Add new service')}
        </Button>
      </div>
      <div className={styles.tileContainer}>
        <Tile className={styles.tile}>
          <p className={styles.content}>{t('noPatientsToDisplay', 'No patients to display')}</p>
          <ExtensionSlot
            extensionSlotName="patient-search-button-slot"
            state={{
              buttonText: t('addPatientToQueue', 'Add patient to queue'),
              overlayHeader: t('addPatientToQueue', 'Add patient to queue'),
              buttonProps: {
                kind: 'ghost',
                renderIcon: (props) => <Add size={16} {...props} />,
                size: 'sm',
              },
              selectPatientAction: (selectedPatientUuid) => {
                setShowOverlay(true);
                setView(SearchTypes.SCHEDULED_VISITS);
                setViewState({ selectedPatientUuid });
              },
            }}
          />
        </Tile>
      </div>
      {showOverlay && <PatientSearch view={view} closePanel={() => setShowOverlay(false)} viewState={viewState} />}
    </div>
  );
}

export default ActiveVisitsTabs;
