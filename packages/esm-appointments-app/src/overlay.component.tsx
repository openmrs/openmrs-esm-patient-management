import React from 'react';
import { ArrowLeft16, Close16 } from '@carbon/icons-react';
import { Button, Header } from 'carbon-components-react';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './overlay.scss';
import { closeOverlay, useOverlay } from './hooks/useOverlay';

const Overlay: React.FC = () => {
  const { header, component, isOverlayOpen } = useOverlay();
  const isDesktop = useLayoutType() === 'desktop';

  return (
    <>
      {isOverlayOpen && (
        <div className={isDesktop ? styles.desktopOverlay : styles.tabletOverlay}>
          {isDesktop ? (
            <div className={styles.desktopHeader}>
              <div className={styles.headerContent}>{header}</div>
              <Button className={styles.closePanelButton} onClick={() => closeOverlay()} kind="ghost" hasIconOnly>
                <Close16 />
              </Button>
            </div>
          ) : (
            <Header onClick={() => closeOverlay()} aria-label="Tablet overlay" className={styles.tabletOverlayHeader}>
              <Button hasIconOnly>
                <ArrowLeft16 />
              </Button>
              <div className={styles.headerContent}>{header}</div>
            </Header>
          )}
          <div>{component}</div>
        </div>
      )}
    </>
  );
};

export default Overlay;
