import React from 'react';
import { ArrowLeft16, Close16 } from '@carbon/icons-react';
import { Button, Header } from 'carbon-components-react';
import styles from './overlay.scss';
import { useLayoutType } from '@openmrs/esm-framework';

interface OverlayProps {
  closePanel: () => void;
  header: string;
}

const Overlay: React.FC<OverlayProps> = ({ closePanel, children, header }) => {
  const isDesktop = useLayoutType() === 'desktop';

  return (
    <div className={isDesktop ? styles.desktopOverlay : styles.tabletOverlay}>
      {isDesktop ? (
        <div className={styles.desktopHeader}>
          <div className={styles.headerContent}>{header}</div>
          <Button className={styles.closePanelButton} onClick={closePanel} kind="ghost" hasIconOnly>
            <Close16 />
          </Button>
        </div>
      ) : (
        <Header className={styles.tabletOverlayHeader}>
          <Button onClick={closePanel} hasIconOnly>
            <ArrowLeft16 onClick={closePanel} />
          </Button>
          <div className={styles.headerContent}>{header}</div>
        </Header>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Overlay;
