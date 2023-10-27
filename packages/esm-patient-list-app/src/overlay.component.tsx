import React from 'react';
import { Button, Header } from '@carbon/react';
import { ArrowLeft, Close } from '@carbon/react/icons';
import { useLayoutType, isDesktop } from '@openmrs/esm-framework';
import styles from './overlay.scss';

interface OverlayProps {
  close: () => void;
  header: string;
  buttonsGroup?: React.ReactElement;
  children?: React.ReactNode;
}

const Overlay: React.FC<OverlayProps> = ({ close, children, header, buttonsGroup }) => {
  const layout = useLayoutType();

  return (
    <div className={isDesktop(layout) ? styles.desktopOverlay : styles.tabletOverlay}>
      {isDesktop(layout) ? (
        <div className={styles.desktopHeader}>
          <span className={styles.headerContent}>{header}</span>
          <Button
            className={styles.closeButton}
            hasIconOnly
            iconDescription="Close overlay"
            kind="ghost"
            onClick={close}
            renderIcon={(props) => <Close size={16} {...props} />}
            size="lg"
          />
        </div>
      ) : (
        <Header aria-label="Tablet overlay" className={styles.tabletOverlayHeader}>
          <Button
            onClick={close}
            hasIconOnly
            renderIcon={(props) => <ArrowLeft size={16} {...props} />}
            iconDescription="Close overlay"
          />
          <div className={styles.headerContent}>{header}</div>
        </Header>
      )}
      <div className={styles.overlayContent}>{children}</div>
      <div className={styles.buttonsGroup}>{buttonsGroup}</div>
    </div>
  );
};

export default Overlay;
