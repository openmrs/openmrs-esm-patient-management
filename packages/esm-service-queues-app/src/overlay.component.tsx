import React from 'react';
import { Button, Header } from '@carbon/react';
import { ArrowLeft, Close } from '@carbon/react/icons';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import styles from './overlay.scss';

interface OverlayProps {
  closePanel: () => void;
  header: string;
  children?: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ closePanel, children, header }) => {
  const layout = useLayoutType();

  return (
    <div className={isDesktop(layout) ? styles.desktopOverlay : styles.tabletOverlay}>
      {isDesktop(layout) ? (
        <div className={styles.desktopHeader}>
          <div className={styles.headerContent}>{header}</div>
          <Button
            className={styles.closePanelButton}
            onClick={closePanel}
            kind="ghost"
            hasIconOnly
            renderIcon={(props) => <Close size={16} {...props} />}
            iconDescription="Close overlay"
          />
        </div>
      ) : (
        <Header aria-label="Tablet overlay" className={styles.tabletOverlayHeader}>
          <Button
            onClick={closePanel}
            hasIconOnly
            renderIcon={(props) => <ArrowLeft size={16} {...props} />}
            iconDescription="Close overlay"
          />
          <div className={styles.headerContent}>{header}</div>
        </Header>
      )}
      <div>{children}</div>
    </div>
  );
};

export default Overlay;
