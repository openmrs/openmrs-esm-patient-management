import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Header } from '@carbon/react';
import { ArrowLeft, Close } from '@carbon/react/icons';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import styles from './overlay.scss';

interface OverlayProps {
  close: () => void;
  children?: React.ReactNode;
  header: string;
  buttonsGroup?: React.ReactElement;
}

const Overlay: React.FC<OverlayProps> = ({ close, children, header, buttonsGroup }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isDesktopView = isDesktop(layout);

  return (
    <div className={classNames(isDesktopView ? styles.desktopOverlay : styles.tabletOverlay)}>
      {isDesktopView ? (
        <div className={styles.desktopHeader}>
          <div className={styles.headerContent}>{header}</div>
          <Button
            className={styles.closeButton}
            hasIconOnly
            iconDescription={t('close', 'Close')}
            kind="primary"
            onClick={close}>
            <Close size={16} />
          </Button>
        </div>
      ) : (
        <Header className={styles.tabletOverlayHeader} aria-label="Close overlay">
          <Button
            className={styles.closeButton}
            hasIconOnly
            iconDescription={t('close', 'Close')}
            kind="ghost"
            onClick={close}>
            <ArrowLeft size={16} />
          </Button>
          <div className={styles.headerContent}>{header}</div>
        </Header>
      )}
      <div className={styles.overlayContent}>{children}</div>
      <div className={styles.buttonsGroup}>{buttonsGroup}</div>
    </div>
  );
};

export default Overlay;
