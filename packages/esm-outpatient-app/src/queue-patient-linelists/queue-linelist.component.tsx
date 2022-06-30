import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Overlay from '../overlay.component';
import QueueLinelistFilter from './queue-linelist-filter.component';
import { filterType } from '../types/index';

interface QueueLinelistProps {
  closePanel: () => void;
}

const QueueLinelist: React.FC<QueueLinelistProps> = ({ closePanel }) => {
  const { t } = useTranslation();
  const [showFilter, setShowFilter] = useState<filterType>(filterType.SHOW);
  const toggleFilter = (filterMode: filterType) => {
    setShowFilter(filterMode);
  };

  return (
    <>
      <Overlay header={t('filters', 'Filters')} closePanel={closePanel}>
        <div className="omrs-main-content">
          {showFilter === filterType.SHOW ? (
            <QueueLinelistFilter toggleFilter={toggleFilter} closePanel={closePanel} />
          ) : null}
        </div>
      </Overlay>
    </>
  );
};

export default QueueLinelist;
