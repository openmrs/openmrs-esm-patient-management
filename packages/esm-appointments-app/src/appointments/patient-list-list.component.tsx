import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import { Button, DataTableHeader, Tab, Tabs } from 'carbon-components-react';
import PatientListTable from './patient-list-table.component';
import CreateNewList from '../ui-components/create-edit-patient-list/create-edit-list.component';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, showModal, useSession } from '@openmrs/esm-framework';
import styles from './patient-list-list.scss';
import { useAllPatientLists } from '../api/hooks';
import { PatientList, PatientListFilter, PatientListType } from '../api/types';
import AppointmentsTable from '../tabs/appointments-table.component';
import PatientSearch from '../patient-search/patient-search.component';

enum TabTypes {
  STARRED,
  SYSTEM,
  USER,
  ALL,
}

const labelMap = ['Booked', 'Missed', 'Cancelled', 'Completed'];

const headersWithoutType: Array<DataTableHeader<keyof PatientList>> = [
  { key: 'display', header: 'List Name' },
  { key: 'size', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

function createLabels() {
  const res: Array<ReactNode> = [];

  for (let index = 0; index < Object.keys(TabTypes).length / 2; index++) {
    res.push(<Tab label={labelMap[index]} key={index} id={'tab-' + index} />);
  }

  return res;
}

function usePatientListFilterForCurrentTab(selectedTab: TabTypes, search: string) {
  return useMemo<PatientListFilter>(() => {
    switch (selectedTab) {
      case TabTypes.STARRED:
        return { isStarred: true, name: search };
      case TabTypes.SYSTEM:
        return { type: PatientListType.SYSTEM, name: search };
      case TabTypes.USER:
        return { type: PatientListType.USER, name: search };
      case TabTypes.ALL:
      default:
        return { name: search };
    }
  }, [selectedTab, search]);
}

function useAppropriateTableHeadersForSelectedTab(selectedTab: TabTypes) {
  return useMemo(
    () => (selectedTab === TabTypes.SYSTEM || selectedTab === TabTypes.USER ? headersWithoutType : undefined),
    [selectedTab],
  );
}

enum RouteStateTypes {
  ALL_LISTS,
  CREATE_NEW_LIST,
}

interface AllListRouteState {
  type: RouteStateTypes.ALL_LISTS;
}

interface CreateNewListState {
  type: RouteStateTypes.CREATE_NEW_LIST;
}

type RouteState = AllListRouteState | CreateNewListState;

function closeOverflowMenu() {
  document.body.dispatchEvent(
    new MouseEvent('mousedown', {
      view: window,
      bubbles: true,
      cancelable: true,
    }),
  );
}

const PatientListList: React.FC = () => {
  const { t } = useTranslation();
  const [routeState, setRouteState] = useState<RouteState>({ type: RouteStateTypes.ALL_LISTS });
  const [selectedTab, setSelectedTab] = useState(TabTypes.STARRED);
  const [searchString, setSearchString] = useState<string>('');
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab, searchString);
  const userId = useSession()?.user.uuid;
  const customHeaders = useAppropriateTableHeadersForSelectedTab(selectedTab);
  const patientListQuery = useAllPatientLists(userId, patientListFilter);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleSearch = (str) => setSearchString(str);

  // const startOverlay = {
  //   setShowOverlay(true);
  // }

  if (patientListQuery.error) {
    //TODO show toast with error
    return null;
  }

  return (
    <main className={`omrs-main-content ${styles.patientListListPage}`}>
      <section className={styles.patientListList}>
        <div className={styles.patientListHeader}>
          <h2 className={styles.productiveHeading03}>{t('appointments', 'Appointments')}</h2>
          <Button
            className={styles.newListButton}
            kind="ghost"
            renderIcon={Add16}
            iconDescription="Add"
            data-floating-menu-primary-focus
            onClick={() => {
              setShowOverlay(true);
            }}>
            {t('addNewAppointment', 'Add New apppointment')}
          </Button>
        </div>
        <Tabs
          className={styles.tabs}
          type="container"
          tabContentClassName={styles.hiddenTabsContent}
          onSelectionChange={setSelectedTab}>
          {createLabels()}
        </Tabs>
        <div className={styles.patientListTableContainer}>
          <AppointmentsTable />
          {showOverlay && <PatientSearch closePanel={() => setShowOverlay(false)} />}
          {/* <PatientListTable
            loading={!patientListQuery.data}
            fetching={patientListQuery.isValidating}
            headers={customHeaders}
            patientLists={patientListQuery.data}
            refetch={patientListQuery.mutate}
            search={{
              onSearch: handleSearch,
              placeHolder: t('search', 'Search'),
              currentSearchTerm: searchString,
            }}
          /> */}
        </div>
      </section>
      <section>
        {routeState.type === RouteStateTypes.CREATE_NEW_LIST && (
          <CreateNewList
            close={() => setRouteState({ type: RouteStateTypes.ALL_LISTS })}
            onSuccess={() => patientListQuery.mutate()}
          />
        )}
      </section>
    </main>
  );
};

export default PatientListList;
