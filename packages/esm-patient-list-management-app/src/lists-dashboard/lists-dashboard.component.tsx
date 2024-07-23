import React, { useMemo, useState } from 'react';
import classnames from 'classnames';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { navigate, PageHeaderContainer, PageHeader, useConfig } from '@openmrs/esm-framework';
import { type ConfigSchema } from '../config-schema';
import { type PatientListFilter, PatientListType } from '../api/types';
import { useAllPatientLists } from '../api/hooks';
import CreateEditPatientList from '../create-edit-patient-list/create-edit-list.component';
import ListsTable from '../lists-table/lists-table.component';
import Illustration from '../illo.component';
import styles from './lists-dashboard.scss';

const TabIndices = {
  STARRED_LISTS: 0,
  SYSTEM_LISTS: 1,
  MY_LISTS: 2,
  ALL_LISTS: 3,
} as const;

function usePatientListFilterForCurrentTab(selectedTab: number) {
  const { t } = useTranslation();

  return useMemo<PatientListFilter>(() => {
    switch (selectedTab) {
      case TabIndices.STARRED_LISTS:
        return { isStarred: true, label: t('starred', 'starred') };
      case TabIndices.SYSTEM_LISTS:
        return { type: PatientListType.SYSTEM, label: t('systemDefined', 'system-defined') };
      case TabIndices.MY_LISTS:
        return { type: PatientListType.USER, label: t('userDefined', 'user-defined') };
      case TabIndices.ALL_LISTS:
      default:
        return { label: '' };
    }
  }, [selectedTab, t]);
}

const ListsDashboard: React.FC = () => {
  const { clinicName, showIllustration } = useConfig<ConfigSchema>();
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState(TabIndices.STARRED_LISTS);
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab);
  const { patientLists, isLoading, error, mutate } = useAllPatientLists(patientListFilter);
  const { search } = useLocation();
  const newCohortUrl = window.getOpenmrsSpaBase() + 'home/patient-lists?new_cohort=true';
  const handleShowNewListOverlay = () => {
    // URL navigation is in place to know either to open the create list overlay or not
    // The url /patient-list?new_cohort=true is being used in the "Add patient to list" widget
    // in the patient chart. The button in the above mentioned widget "Create new list", navigates
    // to /patient-list?new_cohort=true to open the overlay directly.
    navigate({
      to: newCohortUrl,
    });
  };

  const isCreatingPatientList =
    Object.fromEntries(
      search
        .slice(1)
        .split('&')
        ?.map((searchParam) => searchParam?.split('=')),
    )['new_cohort'] === 'true';

  const handleHideNewListOverlay = () => {
    navigate({
      to: window.getOpenmrsSpaBase() + 'home/patient-lists',
    });
  };

  const tableHeaders = [
    { id: 1, key: 'display', header: t('listName', 'List name') },
    { id: 2, key: 'type', header: t('listType', 'List type') },
    { id: 3, key: 'size', header: t('noOfPatients', 'No. of patients') },
    { id: 4, key: 'isStarred', header: '' },
  ];

  return (
    <main className={classnames('omrs-main-content', styles.dashboardContainer)}>
      <section className={styles.dashboard}>
        <PageHeaderContainer className="">
          <PageHeader
            title={t('Patient Lists')}
            illustration={showIllustration ? <Illustration /> : null}
            clinicName={clinicName}
          />
          <Button
            className={styles.newListButton}
            kind="ghost"
            iconDescription="Add"
            renderIcon={(props) => <Add {...props} size={16} />}
            onClick={handleShowNewListOverlay}
            size="sm">
            {t('newList', 'New list')}
          </Button>
        </PageHeaderContainer>
        <Tabs
          className={styles.tabs}
          onChange={({ selectedIndex }) => {
            setSelectedTab(selectedIndex);
          }}
          selectedIndex={selectedTab}
          tabContentClassName={styles.hiddenTabsContent}>
          <TabList className={styles.tablist} aria-label="List tabs" contained>
            <Tab className={styles.tab}>{t('starredLists', 'Starred lists')}</Tab>
            <Tab className={styles.tab}>{t('systemLists', 'System lists')}</Tab>
            <Tab className={styles.tab}>{t('myLists', 'My lists')}</Tab>
            <Tab className={styles.tab}>{t('allLists', 'All lists')}</Tab>
          </TabList>
        </Tabs>
        <div className={styles.listsTableContainer}>
          <ListsTable
            error={error}
            headers={tableHeaders}
            isLoading={isLoading}
            key={patientListFilter.label}
            listType={patientListFilter.label}
            patientLists={patientLists}
            refetch={mutate}
          />
        </div>
      </section>
      <section>
        {isCreatingPatientList && <CreateEditPatientList close={handleHideNewListOverlay} onSuccess={() => mutate()} />}
      </section>
    </main>
  );
};

export default ListsDashboard;
