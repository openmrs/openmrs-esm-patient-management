import React from 'react';
import ArrowLeft16 from '@carbon/icons-react/es/arrow--left/16';
import { Button, Header } from 'carbon-components-react';

const Overlay: React.FC<{ close: () => void; header: string }> = ({ close, children, header }) => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        position: 'absolute',
        top: '0px',
        left: '0px',
        zIndex: 9001,
        backgroundColor: '#ededed',
        padding: '1rem 2rem',
        marginTop: '48px',
      }}>
      <Header>
        <Button style={{ backgroundColor: 'transparent', padding: '15px' }} onClick={close}>
          <ArrowLeft16 onClick={close} />
        </Button>
        <div>{header}</div>
      </Header>
      {children}
    </div>
  );
};

export default Overlay;
