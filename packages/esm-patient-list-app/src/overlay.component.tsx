import React from 'react';
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16';
import { Button, Header } from 'carbon-components-react';
import styles from './overlay.scss';

interface OverlayProps {
  close: () => void;
  header: string;
}

const Overlay: React.FC<OverlayProps> = ({ close, children, header }) => {
  return (
    <div className={styles.overlay}>
      <Header>
        <Button onClick={close} hasIconOnly>
          <ArrowLeft16 onClick={close} />
        </Button>
        <div>{header}</div>
      </Header>
      {children}
    </div>
  );
};

export default Overlay;
