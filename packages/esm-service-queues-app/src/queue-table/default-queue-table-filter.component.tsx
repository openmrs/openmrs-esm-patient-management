import React, { useEffect, useState } from 'react';
import styles from './queue-table.scss';
import { Dropdown, Popover, PopoverContent, Button } from '@carbon/react';
import { useQueuePriorities } from '../hooks/useQueuePriorities';
import { useQueueStatuses } from '../hooks/useQueueStatus';
import classNames from 'classnames';
import { ButtonSet } from '@carbon/react';
import {
  updateSelectedQueuePriority,
  updateSelectedQueueStatus,
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useSelectedPriority,
  useSelectedQueueLocationUuid,
  useSelectedServiceName,
  useSelectedStatus,
} from '../helpers/helpers';
import { useTranslation } from 'react-i18next';
import { type OpenmrsResource, isDesktop, useLayoutType } from '@openmrs/esm-framework';
import { useQueues } from '../hooks/useQueues';
import { Filter, FilterEdit, FilterRemove } from '@carbon/react/icons';

function QueuePriorityFilter({
  selectedItem,
  onChange,
}: {
  selectedItem: string;
  onChange: (x: { selectedItem: OpenmrsResource }) => void;
}) {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { priorities = [], isLoadingPriorities } = useQueuePriorities();

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="priorityFilter"
          titleText={t('filterPatientsByPriorty', 'Filter patients for priority:')}
          label={priorities?.find((priority) => priority.uuid === selectedItem)?.display || t('all', 'All')}
          items={[{ display: `${t('all', 'All')}` }, ...priorities]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={onChange}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          disabled={isLoadingPriorities}
        />
      </div>
    </>
  );
}

function QueueStatusFilter({
  selectedItem,
  onChange,
}: {
  selectedItem: string;
  onChange: (x: { selectedItem: OpenmrsResource }) => void;
}) {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { statuses = [], isLoadingStatuses } = useQueueStatuses();

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="priorityFilter"
          titleText={t('filterPatientsByStatus', 'Status')}
          label={statuses?.find((priority) => priority.uuid === selectedItem)?.display || t('all', 'All')}
          items={[{ display: `${t('all', 'All')}` }, ...statuses]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={onChange}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
      </div>
    </>
  );
}

export function QueueFilterPopOver() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const layout = useLayoutType();
  const [formState, setFormState] = useState<{
    priority: string;
    status: string;
  }>({
    priority: null,
    status: null,
  });

  const { priorityUuid } = useSelectedPriority();
  const { statusUuid } = useSelectedStatus();
  const isFilterApplied = priorityUuid || statusUuid;

  useEffect(() => {
    setFormState({
      priority: priorityUuid,
      status: statusUuid,
    });
  }, [priorityUuid, statusUuid]);

  const handleChange = (filterType: 'status' | 'priority', selectedItem: OpenmrsResource) => {
    setFormState((prev) => ({
      ...prev,
      [filterType]: selectedItem.uuid,
    }));
  };

  const closePopOver = () => {
    setFormState({
      priority: null,
      status: null,
    });
    setOpen(false);
  };

  const handleApplyFilters = () => {
    updateSelectedQueuePriority(formState['priority']);
    updateSelectedQueueStatus(formState['status']);
    closePopOver();
  };

  const resetFilters = () => {
    updateSelectedQueuePriority(null);
    updateSelectedQueueStatus(null);
    closePopOver();
  };

  return (
    <>
      <Popover open={open} align="bottom-right" caret={false} isTabTip>
        <Button
          hasIconOnly
          renderIcon={isFilterApplied ? FilterEdit : Filter}
          iconDescription={isFilterApplied ? t('editFilters', 'Edit filters') : t('filters', 'Filters')}
          className={classNames({
            [styles.whiteBackground]: open,
          })}
          type="button"
          onClick={() => {
            setOpen(!open);
          }}
          kind="ghost"
          size={isDesktop(layout) ? 'sm' : 'lg'}>
          {isFilterApplied ? t('editFilters', 'Edit filters') : t('filters', 'Filters')}
        </Button>
        <PopoverContent>
          <div className={styles.popOver}>
            <QueuePriorityFilter
              selectedItem={formState['priority']}
              onChange={({ selectedItem }) => handleChange('priority', selectedItem)}
            />
            <QueueStatusFilter
              selectedItem={formState['status']}
              onChange={({ selectedItem }) => handleChange('status', selectedItem)}
            />
          </div>
          <ButtonSet className={styles.buttonSet}>
            <Button size={isDesktop(layout) ? 'sm' : 'lg'} kind="secondary" onClick={resetFilters}>
              {t('resetFilters', 'Reset')}
            </Button>
            <Button size={isDesktop(layout) ? 'sm' : 'lg'} kind="primary" onClick={handleApplyFilters}>
              {t('apply', 'Apply')}
            </Button>
          </ButtonSet>
        </PopoverContent>
      </Popover>
      {isFilterApplied && (
        <Button
          renderIcon={FilterRemove}
          type="button"
          onClick={resetFilters}
          kind="ghost"
          size={isDesktop(layout) ? 'sm' : 'lg'}>
          {t('clearFilters', 'Clear filters')}
        </Button>
      )}
    </>
  );
}

export function QueueLocationFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { queues } = useQueues(currentQueueLocation);
  const currentServiceName = useSelectedServiceName();
  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedServiceUuid(selectedItem.uuid);
    updateSelectedServiceName(selectedItem.display);
  };

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="serviceFilter"
          titleText={t('showPatientsWaitingFor', 'Show patients waiting for:')}
          label={currentServiceName}
          type="inline"
          items={[{ display: `${t('all', 'All')}` }, ...queues]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={handleServiceChange}
          size={isDesktop(layout) ? 'sm' : 'lg'}
        />
      </div>
    </>
  );
}
