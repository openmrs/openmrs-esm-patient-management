import React, { useEffect } from 'react';
import styles from './o2-page.scss';

interface O2PageProps {
  src: string;
}

const O2Page: React.FC<O2PageProps> = ({ src }) => {
  useEffect(() => {
    const iframe = document.querySelector('iframe');
    iframe.addEventListener('load', () => {
      const dashboard = iframe.contentDocument;
      dashboard.querySelector('header')?.remove();
      dashboard.querySelector('.patient-header')?.remove();
      dashboard.querySelector('#breadcrumbs')?.remove();
      iframe.style.display = 'block';
    });
  }, []);

  return (
    <div>
      <iframe src={src} className={styles.dashboard}></iframe>
    </div>
  );
};

export default O2Page;
