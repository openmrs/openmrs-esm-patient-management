import React from 'react';
import { Button, Header } from '@carbon/react';
import { ArrowLeft, Close } from '@carbon/react/icons';
import { useLayoutType } from '@openmrs/esm-framework';
import { closeOverlay, useOverlay } from './hooks/useOverlay';
import styles from './overlay.scss';

const Overlay: React.FC = () => {
  const { header, component, isOverlayOpen } = useOverlay();
  const layout = useLayoutType();
  return (
    <>
      {isOverlayOpen && (
        <div className={layout !== 'tablet' ? styles.desktopOverlay : styles.tabletOverlay}>
          {layout !== 'tablet' ? (
            <div className={styles.desktopHeader}>
              <div className={styles.headerContent}>{header}</div>
              <Button className={styles.closePanelButton} onClick={() => closeOverlay()} kind="ghost" hasIconOnly>
                <Close size={16} />
              </Button>
            </div>
          ) : (
            <Header onClick={() => closeOverlay()} aria-label="Tablet overlay" className={styles.tabletOverlayHeader}>
              <Button hasIconOnly>
                <ArrowLeft size={16} />
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
