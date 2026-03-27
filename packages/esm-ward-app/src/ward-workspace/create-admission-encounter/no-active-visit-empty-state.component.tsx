import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Layer, Tile } from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { ExtensionSlot, useLayoutType, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { EmptyDataIllustration } from '../admission-request-workspace/empty-data-illustration.component';
import styles from './no-active-visit-empty-state.scss';

interface NoActiveVisitEmptyStateProps {
  patientUuid: string;
  launchChildWorkspace: Workspace2DefinitionProps['launchChildWorkspace'];
  startVisitWorkspaceName: string;
  closeWorkspace: () => void;
}

const NoActiveVisitEmptyState: React.FC<NoActiveVisitEmptyStateProps> = ({
  patientUuid,
  launchChildWorkspace,
  startVisitWorkspaceName,
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isDesktop = useLayoutType() !== 'tablet';

  return (
    <Layer>
      <Tile className={classNames(styles.emptyStateTile, { [styles.desktopTile]: isDesktop })}>
        <div className={styles.illustration}>
          <EmptyDataIllustration />
        </div>
        <p className={styles.content}>{t('noActiveVisit', 'No active visit')}</p>
        <p className={styles.helperText}>
          {t(
            'noActiveVisitHelperText',
            'An active visit is required to admit this patient to the ward. Please start a visit to continue with the admission process.',
          )}
        </p>
        <div className={styles.action}>
          <ExtensionSlot
            name="start-visit-button-slot2"
            state={{
              patientUuid,
              launchChildWorkspace,
              startVisitWorkspaceName,
            }}
          />
        </div>
        <p className={styles.separator}>{t('or', 'or')}</p>
        <Button kind="ghost" size="sm" onClick={() => closeWorkspace()} className={styles.backButton}>
          <ArrowLeft size={16} />
          <span>{t('chooseAnotherPatient', 'Choose another patient')}</span>
        </Button>
      </Tile>
    </Layer>
  );
};

export default NoActiveVisitEmptyState;
