// import React from 'react';
// import classNames from 'classnames';
// import { OverflowMenuItem } from '@carbon/react';
// import { OverflowMenuVertical } from '@carbon/react/icons';
// import { CustomOverflowMenu } from '@openmrs/esm-framework';
// import ListDetailsTable from '../list-details-table/list-details-table.component';
// import styles from './list-details.scss';

// interface PatientListViewProps {
//   title: string;
//   description?: string;
//   size?: number;
//   createdOn?: string | null;
//   onEdit?: () => void;
//   onDelete?: () => void;
//   columns: any[];
//   patients: any[];
//   isLoading?: boolean;
//   isFetching?: boolean;
//   pagination?: any;
//   cohortUuid?: string;
//   mutateListDetails?: () => void;
//   mutateListMembers?: () => void;
// }

// const PatientListView: React.FC<PatientListViewProps> = ({
//   title,
//   description,
//   size,
//   createdOn,
//   onEdit,
//   onDelete,
//   columns,
//   patients,
//   isLoading,
//   isFetching,
//   pagination,
//   cohortUuid,
//   mutateListDetails,
//   mutateListMembers,
// }) => {
//   return (
//     <main className={styles.container}>
//       <section className={styles.cohortHeader}>
//         <div>
//           <h1 className={styles.productiveHeading03}>{title ?? '--'}</h1>
//           <h4 className={classNames(styles.bodyShort02, styles.marginTop)}>{description ?? '--'}</h4>
//           <div className={classNames(styles.text02, styles.bodyShort01, styles.marginTop)}>
//             {size ?? '--'} patients &middot;{' '}
//             <span className={styles.label01}>Created on:</span> {createdOn ?? '--'}
//           </div>
//         </div>

//         {(onEdit || onDelete) && (
//           <div className={styles.overflowMenu}>
//             <CustomOverflowMenu
//               menuTitle={
//                 <>
//                   <span className={styles.actionsButtonText}>Actions</span>{' '}
//                   <OverflowMenuVertical size={16} style={{ marginLeft: '0.5rem' }} />
//                 </>
//               }>
//               {onEdit && (
//                 <OverflowMenuItem
//                   className={styles.menuItem}
//                   itemText="Edit name or description"
//                   onClick={onEdit}
//                 />
//               )}
//               {onDelete && (
//                 <OverflowMenuItem
//                   className={styles.menuItem}
//                   isDelete
//                   itemText="Delete patient list"
//                   onClick={onDelete}
//                 />
//               )}
//             </CustomOverflowMenu>
//           </div>
//         )}
//       </section>

//       <section>
//         <div className={styles.tableContainer}>
//           <ListDetailsTable
//             cohortUuid={cohortUuid}
//             columns={columns}
//             isFetching={isFetching}
//             isLoading={isLoading}
//             patients={patients}
//             pagination={pagination}
//             mutateListDetails={mutateListDetails}
//             mutateListMembers={mutateListMembers}
//           />
//         </div>
//       </section>
//     </main>
//   );
// };

// export default PatientListView;
