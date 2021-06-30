import React, { useEffect } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from 'carbon-components-react';
import { useLayoutType, Visit } from '@openmrs/esm-framework';
import { fetchActiveVisits } from './active-visits.resource';
import styles from './active-visits.scss';

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
  const [activeVisits, setActiveVisits] = React.useState([]);

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
    });
    return () => activeVisits.unsubscribe();
  }, []);
  return (
    <div className={styles.activeVisitsContainer}>
      <div className={styles.activeVisitsDetailHeaderContainer}>
        <h4 className={styles.productiveHeading02}>Active Visits in Clinic</h4>
      </div>
      <DataTable rows={activeVisits} headers={headerData} isSortable>
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
                {rows.map((row) => (
                  <TableRow key={row.id} style={{ height: desktopView ? '2rem' : '3rem' }}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default ActiveVisitsTable;
