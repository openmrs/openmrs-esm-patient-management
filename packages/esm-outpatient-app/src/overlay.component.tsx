import React from 'react';
import { ArrowLeft16, Close16 } from '@carbon/icons-react';
import { Button, Header } from 'carbon-components-react';
import styles from './overlay.scss';
import { useLayoutType } from '@openmrs/esm-framework';

interface OverlayProps {
  close: () => void;
  header: string;
}

const Overlay: React.FC<OverlayProps> = ({ close, children, header }) => {
  const isDesktop = useLayoutType() === 'desktop';

  return (
    <div className={isDesktop ? styles.desktopOverlay : styles.tabletOverlay}>
      {isDesktop ? (
        <div className={styles.desktopHeader}>
          <div className={styles.headerContent}>{header}</div>
          <Button className={styles.closeButton} onClick={close} kind="ghost" hasIconOnly>
            <Close16 />
          </Button>
        </div>
      ) : (
        <Header className={styles.tabletOverlayHeader}>
          <Button onClick={close} hasIconOnly>
            <ArrowLeft16 onClick={close} />
          </Button>
          <div className={styles.headerContent}>{header}</div>
        </Header>
      )}
      <div className={styles.overlayContent}>{children}</div>
    </div>
  );
};

export default Overlay;
