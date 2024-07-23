import React from 'react';
import classNames from 'classnames';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './card-header.scss';

interface CardHeaderProps {
  title: string;
  children: React.ReactNode;
}

export function CardHeader({ title, children }: CardHeaderProps) {
  const isTablet = useLayoutType() === 'tablet';

  return (
    <div className={classNames(isTablet ? styles.tabletHeader : styles.desktopHeader)}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
