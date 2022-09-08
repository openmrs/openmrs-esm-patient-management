import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '../overlay.component';
import QueueLinelistFilter from './queue-linelist-filter.component';
import { FilterTypes } from '../types/index';

interface QueueLinelistProps {
  closePanel: () => void;
}

const QueueLinelist: React.FC<QueueLinelistProps> = ({ closePanel }) => {
  const { t } = useTranslation();
  const [showFilter, setShowFilter] = useState<FilterTypes>(FilterTypes.SHOW);
  const toggleFilter = (filterType: FilterTypes) => {
    setShowFilter(filterType);
  };

  return (
    <>
      <Overlay header={t('filters', 'Filters')} closePanel={closePanel}>
        <div className="omrs-main-content">
          {showFilter === FilterTypes.SHOW ? <QueueLinelistFilter closePanel={closePanel} /> : null}
        </div>
      </Overlay>
    </>
  );
};

export default QueueLinelist;
