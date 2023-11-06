import React, { useState, useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Button } from '@carbon/react';
import styles from './overflow-menu.scss';

interface CustomOverflowMenuComponentProps {
  menuTitle: React.ReactNode;
  dropdownMenu: boolean;
  children?: React.ReactNode;
  isDeceased?: boolean;
}

const CustomOverflowMenuComponent: React.FC<CustomOverflowMenuComponentProps> = ({
  dropdownMenu,
  menuTitle,
  children,
  isDeceased,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!dropdownMenu) {
      setShowMenu((state) => state);
    }

    setShowMenu(() => false);
  }, [dropdownMenu]);
  const toggleShowMenu = useCallback(() => setShowMenu((state) => !state), []);

  useEffect(() => {
    /**
     * Toggle showMenu if clicked on outside of element
     */
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div data-overflow-menu className={classNames('cds--overflow-menu', styles.container)} ref={wrapperRef}>
      <Button
        className={classNames('cds--overflow-menu__trigger', styles.overflowMenuButton, {
          'cds--overflow-menu--open': showMenu,
          [styles.deceased]: isDeceased,
        })}
        aria-controls="custom-actions-overflow-menu"
        aria-expanded={showMenu}
        aria-haspopup
        id="custom-actions-overflow-menu-trigger"
        kind="ghost"
        onClick={toggleShowMenu}>
        {menuTitle}
      </Button>
      <div
        aria-labelledby="custom-actions-overflow-menu-trigger"
        className={classNames('cds--overflow-menu-options', 'cds--overflow-menu--flip', styles.menu, {
          [styles.show]: showMenu,
        })}
        data-floating-menu-direction="bottom"
        id="custom-actions-overflow-menu"
        role="menu"
        tabIndex={0}>
        <ul className="cds--overflow-menu-options__content">{children}</ul>
        <span />
      </div>
    </div>
  );
};

export default CustomOverflowMenuComponent;
