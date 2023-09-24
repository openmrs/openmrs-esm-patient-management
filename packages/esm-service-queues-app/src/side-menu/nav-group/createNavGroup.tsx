import React from 'react';
import NavGroupExtension from './nav-group.component';

export const createNavGroup = ({
  title,
  slot,
  renderIcon,
}: {
  title: string;
  slot: string;
  renderIcon?: React.ComponentType<any>;
}) => {
  const NavGroup = () => {
    return <NavGroupExtension title={title} slotName={slot} renderIcon={renderIcon} />;
  };
  return NavGroup;
};
