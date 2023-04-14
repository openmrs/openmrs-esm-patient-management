import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './overflow-menu.scss';

interface CustomOverflowMenuComponentProps {
  menuTitle: React.ReactNode;
  dropDownMenu: boolean;
  children: React.ReactNode;
  deceased?: boolean;
}

const CustomOverflowMenuComponent: React.FC<CustomOverflowMenuComponentProps> = ({
  dropDownMenu,
  menuTitle,
  children,
  deceased,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!dropDownMenu) {
      setShowMenu((state) => state);
    }

    setShowMenu(() => false);
  }, [dropDownMenu]);
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
    <div data-overflow-menu className={`cds--overflow-menu ${styles.container}`} ref={wrapperRef}>
      <button
        className={`cds--btn cds--btn--ghost cds--overflow-menu__trigger ${showMenu && 'cds--overflow-menu--open'} ${
          deceased && styles.deceased
        } ${styles.overflowMenuButton}`}
        aria-haspopup="true"
        aria-expanded={showMenu}
        id="custom-actions-overflow-menu-trigger"
        aria-controls="custom-actions-overflow-menu"
        onClick={toggleShowMenu}>
        {menuTitle}
      </button>
      <div
        className={`cds--overflow-menu-options cds--overflow-menu--flip ${styles.menu} ${showMenu && styles.show}`}
        tabIndex={0}
        data-floating-menu-direction="bottom"
        role="menu"
        aria-labelledby="custom-actions-overflow-menu-trigger"
        id="custom-actions-overflow-menu">
        <ul className="cds--overflow-menu-options__content">{children}</ul>
        <span />
      </div>
    </div>
  );
};

export default CustomOverflowMenuComponent;
