import React from 'react';
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
  const layout = useLayoutType();

  return (
    <div className={isDesktop(layout) ? styles.desktopOverlay : styles.tabletOverlay}>
      {isDesktop(layout) ? (
        <div className={styles.desktopHeader}>
          <div className={styles.headerContent}>{header}</div>
          <Button className={styles.closeButton} onClick={close} kind="ghost" hasIconOnly>
            <Close size={16} />
          </Button>
        </div>
      ) : (
        <Header className={styles.tabletOverlayHeader}>
          <Button onClick={close} hasIconOnly>
            <ArrowLeft size={16} onClick={close} />
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
