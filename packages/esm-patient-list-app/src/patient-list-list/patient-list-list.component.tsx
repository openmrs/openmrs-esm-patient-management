import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import { Button, DataTableHeader, Tab, Tabs } from 'carbon-components-react';
import PatientListTable from './patient-list-table.component';
import CreateNewList from '../ui-components/create-edit-patient-list/create-edit-list.component';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, useSessionUser } from '@openmrs/esm-framework';
import {
  usePatientListDataQuery,
  useToggleStarredMutation,
  PatientList,
  PatientListFilter,
  PatientListType,
} from '../api';
import styles from './patient-list-list.scss';

enum TabTypes {
  STARRED,
  SYSTEM,
  USER,
  ALL,
}

const labelMap = ['Starred', 'System lists', 'My lists', 'All'];

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

const PatientListList: React.FC = () => {
  const { t } = useTranslation();
  const [routeState, setRouteState] = useState<RouteState>({ type: RouteStateTypes.ALL_LISTS });
  const [selectedTab, setSelectedTab] = useState(TabTypes.STARRED);
  const [searchString, setSearchString] = useState<string>('');
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab, searchString);
  const userId = useSessionUser()?.user.uuid;
  const customHeaders = useAppropriateTableHeadersForSelectedTab(selectedTab);
  const patientListQuery = usePatientListDataQuery(userId, patientListFilter);
  const toggleStarredMutation = useToggleStarredMutation();

  const handleListStarred = useCallback(
    async (listUuid: string, isStarred: boolean) => {
      await toggleStarredMutation.refetch({ userId, patientListId: listUuid, isStarred });
      await patientListQuery.refetch();
    },
    [toggleStarredMutation, patientListQuery, userId],
  );

  const handleSearch = (str) => setSearchString(str);

  const handleCreateListSuccess = useCallback(() => {
    patientListQuery.refetch();
  }, [patientListQuery]);

  if (patientListQuery.error) {
    //TODO show toast with error
    return null;
  }

  return (
    <main className={`omrs-main-content ${styles.patientListListPage}`}>
      <section className={styles.patientListList}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" className={styles.breadcrumbsSlot} />
        <div className={styles.patientListHeader}>
          <h2 className={styles.productiveHeading03}>{t('patientLists', 'Patient Lists')}</h2>
          <Button
            className={styles.newListButton}
            kind="ghost"
            renderIcon={Add16}
            iconDescription="Add"
            onClick={() => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST })}>
            {t('newList', 'New List')}
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
          <PatientListTable
            loading={!patientListQuery?.data}
            fetching={patientListQuery?.isFetching}
            headers={customHeaders}
            patientLists={patientListQuery.data}
            refetch={patientListQuery.refetch}
            search={{
              onSearch: handleSearch,
              placeHolder: t('search', 'Search'),
              currentSearchTerm: searchString,
            }}
          />
        </div>
      </section>
      <section>
        {routeState.type === RouteStateTypes.CREATE_NEW_LIST && (
          <CreateNewList
            close={() => setRouteState({ type: RouteStateTypes.ALL_LISTS })}
            onSuccess={handleCreateListSuccess}
          />
        )}
      </section>
    </main>
  );
};

export default PatientListList;
