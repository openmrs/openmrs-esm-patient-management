import React from 'react';
import styles from '../prescription-template.scss';

interface WatermarkProps {
  logoUrl?: string;
  alignment?: 'left' | 'center' | 'right';
  opacity?: number;
}

export const Watermark: React.FC<WatermarkProps> = ({ logoUrl, alignment = 'center', opacity = 0.04 }) => {
  if (!logoUrl) return null;

  return (
    <div
      className={styles.watermark}
      data-alignment={alignment}
      style={{ '--watermark-opacity': opacity } as React.CSSProperties}>
      <img src={logoUrl} alt="Watermark" />
    </div>
  );
};
