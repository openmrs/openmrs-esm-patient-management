import React, { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableHeader, Tab, Tabs, TabList } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot, navigate } from '@openmrs/esm-framework';
import { useAllPatientLists } from '../api/hooks';
import { PatientList, PatientListFilter, PatientListType } from '../api/types';
import CreateNewList from '../create-edit-patient-list/create-edit-list.component';
import PatientListTable from './patient-list-table.component';
import styles from './patient-list-list.scss';
import { useLocation } from 'react-router-dom';

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
    res.push(
      <Tab key={index} id={'tab-' + index}>
        {labelMap[index]}
      </Tab>,
    );
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

const PatientListList: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(TabTypes.STARRED);
  const [searchString, setSearchString] = useState<string>('');
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab, searchString);
  const customHeaders = useAppropriateTableHeadersForSelectedTab(selectedTab);
  const patientListQuery = useAllPatientLists(patientListFilter);
  const { search } = useLocation();
  const createNewList =
    Object.fromEntries(
      search
        .slice(1)
        .split('&')
        ?.map((searchParam) => searchParam?.split('=')),
    )['new_cohort'] === 'true';

  const handleShowNewListOverlay = () => {
    navigate({
      to: '${openmrsSpaBase}/patient-list?new_cohort=true',
    });
  };

  const handleHideNewListOverlay = () => {
    navigate({
      to: '${openmrsSpaBase}/patient-list',
    });
  };

  const handleSearch = (str) => setSearchString(str);

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
            renderIcon={(props) => <Add {...props} size={16} />}
            iconDescription="Add"
            onClick={handleShowNewListOverlay}>
            {t('newList', 'New List')}
          </Button>
        </div>
        <Tabs className={styles.tabs} tabContentClassName={styles.hiddenTabsContent} onSelectionChange={setSelectedTab}>
          <TabList aria-label="List tabs" contained>
            {createLabels()}
          </TabList>
        </Tabs>
        <div className={styles.patientListTableContainer}>
          <PatientListTable
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
          />
        </div>
      </section>
      <section>
        {createNewList && (
          <CreateNewList close={handleHideNewListOverlay} onSuccess={() => patientListQuery.mutate()} />
        )}
      </section>
    </main>
  );
};

export default PatientListList;
