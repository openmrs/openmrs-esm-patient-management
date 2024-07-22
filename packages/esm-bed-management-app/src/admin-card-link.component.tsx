import React from 'react';
import { useTranslation } from 'react-i18next';
import { Layer, ClickableTile } from '@carbon/react';
import { ArrowRight } from '@carbon/react/icons';

const BedManagementAdminCardLink: React.FC = () => {
  const { t } = useTranslation();
  const header = t('manageBeds', 'Manage Beds');
  return (
    <Layer>
      <ClickableTile href={window.getOpenmrsSpaBase() + 'bed-management/summary'} rel="noopener noreferrer">
        <div>
          <div className="heading">{header}</div>
          <div className="content">{t('bedManagement', 'Bed Management')}</div>
        </div>
        <div className="iconWrapper">
          <ArrowRight size={16} />
        </div>
      </ClickableTile>
    </Layer>
  );
};

export default BedManagementAdminCardLink;
