import React, { useEffect } from 'react';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { SideNavMenu } from '@carbon/react';
import { registerNavGroup } from './nav-group';

export interface NavGroupExtensionProps {
  title: string;
  slotName: string;
  renderIcon?: React.ComponentType<any>;
}

const NavGroupExtension = ({ title, slotName, renderIcon }: NavGroupExtensionProps) => {
  useEffect(() => {
    registerNavGroup(slotName);
  }, [slotName]);

  return (
    <SideNavMenu renderIcon={renderIcon} title={title}>
      <ExtensionSlot extensionSlotName={slotName} />
    </SideNavMenu>
  );
};

export default NavGroupExtension;
