import React, { useEffect, useState } from 'react';
import DataTable, {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTableSkeleton,
} from 'carbon-components-react/es/components/DataTable';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import { useLayoutType, Visit } from '@openmrs/esm-framework';
import { ActiveVisitRow, fetchActiveVisits } from './active-visits.resource';
import styles from './active-visits.scss';
import { useTranslation } from 'react-i18next';

const headerData = [
  {
    id: 0,
    header: 'Wait (mins)',
    key: 'wait',
  },
  {
    id: 1,
    header: 'ID Number',
    key: 'IDNumber',
  },
  {
    id: 2,
    header: 'Name',
    key: 'name',
  },
  {
    id: 3,
    header: 'Gender',
    key: 'gender',
  },
  {
    id: 4,
    header: 'Age',
    key: 'age',
  },
  {
    id: 5,
    header: 'Visit Type',
    key: 'visitType',
  },
];

function getWaitTime(startTime): number {
  const d = new Date();
  const d2 = new Date(startTime);
  return (d.getTime() - d2.getTime()) / 60000;
}

const ActiveVisitsTable = (props) => {
  const layout = useLayoutType();
  const desktopView = layout === 'desktop';
  const [loading, setLoading] = useState(true);
  const [activeVisits, setActiveVisits] = useState<ActiveVisitRow[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    const activeVisits = fetchActiveVisits().subscribe((data) => {
      const rowData = data.results.map((visit, ind) => ({
        id: `${ind}`,
        wait: Math.ceil(getWaitTime(visit.startDatetime)),
        IDNumber: visit?.patient?.identifiers[0]?.identifier,
        name: visit?.patient?.person?.display,
        gender: visit?.patient?.person?.gender,
        age: visit?.patient?.person?.age,
        visitType: visit?.visitType.display,
      }));
      setActiveVisits(rowData);
      setLoading(false);
    });
    return () => activeVisits.unsubscribe();
  }, []);
  return (
    <div className={styles.activeVisitsContainer}>
      <div className={styles.activeVisitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>{t('activeVisits', 'Active Visits in Clinic')}</h4>
      </div>
      <DataTable rows={activeVisits ? activeVisits : []} headers={headerData} isSortable>
        {({ rows, headers, getHeaderProps, getTableProps }) => (
          <TableContainer>
            <Table {...getTableProps()} useZebraStyles>
              <TableHead>
                <TableRow style={{ height: desktopView ? '2rem' : '3rem' }}>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {activeVisits &&
                  rows.map((row) => (
                    <TableRow key={row.id} style={{ height: desktopView ? '2rem' : '3rem' }}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            {loading && (
              <div className={styles.skeletonContainer}>
                <SkeletonText />
              </div>
            )}
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default ActiveVisitsTable;
