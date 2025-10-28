import React, { useState, useMemo } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { formatDate, parseDate } from '@openmrs/esm-framework';
import { useActiveVisits } from '@openmrs/esm-active-visits-app/src/active-visits-widget/active-visits.resource';
import ListDetailsTable from '../list-details-table/list-details-table.component';
import styles from './list-details.scss';

const ActiveVisitsList: React.FC = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);

  const { activeVisits, isLoading, totalResults } = useActiveVisits();

  const patients = useMemo(() => {
    if (!activeVisits?.length) {
      return [];
    }

    const startIndex = (currentPage - 1) * currentPageSize;
    const paginated = activeVisits.slice(startIndex, startIndex + currentPageSize);

    return paginated.map((visit) => ({
      name: visit.name || visit.patientName || 'Unknown',
      identifier: visit.idNumber || visit.identifier || 'N/A',
      sex: visit.gender || visit.sex || '',
      startDate: (() => {
        const rawStart = visit.visitStartTime || visit.startDatetime || visit.visitStartDatetime || visit.startDate;
        return typeof rawStart === 'string' ? formatDate(parseDate(rawStart)) : null;
      })(),
      uuid: visit.patientUuid || (typeof visit.patient === 'string' ? visit.patient : visit.patient?.uuid),
      membershipUuid: visit.visitUuid || visit.uuid || visit.id,
      mobile: (() => {
        const p = typeof visit.patient === 'string' ? undefined : (visit.patient as any);
        return (
          p?.person?.attributes?.find((attr: any) => attr?.attributeType?.display === 'Telephone Number')?.value ?? null
        );
      })(),
    }));
  }, [activeVisits, currentPage, currentPageSize]);

  const headers = useMemo(
    () => [
      {
        key: 'name',
        header: t('name', 'Name'),
        link: {
          getUrl: (patient) =>
            patient?.uuid ? `${window.getOpenmrsSpaBase()}patient/${patient?.uuid}/chart/` : window?.location?.href,
        },
      },
      {
        key: 'identifier',
        header: t('identifier', 'Identifier'),
      },
      {
        key: 'sex',
        header: t('sex', 'Sex'),
      },
      {
        key: 'startDate',
        header: t('visitStartTime', 'Visit Start Time'),
      },
      {
        key: 'mobile',
        header: t('mobile', 'Mobile'),
      },
    ],
    [t],
  );

  return (
    <main className={styles.container}>
      <section className={styles.cohortHeader}>
        <div data-testid="patientListHeader">
          <h1 className={styles.productiveHeading03}>Active Visits</h1>
          <h4 className={classNames(styles.bodyShort02, styles.marginTop)}>
            {t('patientsWithActiveVisits', 'Patients currently with active visits at this location')}
          </h4>
          <div className={classNames(styles.text02, styles.bodyShort01, styles.marginTop)}>
            {totalResults} {t('patients', 'patients')}
          </div>
        </div>
        {/* No actions menu for system list */}
      </section>
      <section>
        <div className={styles.tableContainer}>
          <ListDetailsTable
            cohortUuid="active-visits-system-list"
            columns={headers}
            isFetching={false}
            isLoading={isLoading}
            mutateListDetails={() => {}}
            mutateListMembers={() => {}}
            patients={patients}
            pagination={{
              usePagination: totalResults > currentPageSize,
              currentPage,
              onChange: ({ page, pageSize }) => {
                setCurrentPage(page);
                setCurrentPageSize(pageSize);
              },
              pageSize: currentPageSize,
              totalItems: totalResults,
              pagesUnknown: false,
              lastPage: currentPage * currentPageSize >= totalResults,
            }}
          />
        </div>
      </section>
    </main>
  );
};

export default ActiveVisitsList;
