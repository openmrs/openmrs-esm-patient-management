import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './overflow-menu.scss';

interface CustomOverflowMenuComponentProps {
  menuTitle: React.ReactNode;
}

const CustomOverflowMenuComponent: React.FC<CustomOverflowMenuComponentProps> = ({ menuTitle, children }) => {
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef(null);
  const toggleShowMenu = () => setShowMenu((state) => !state);

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
    <div data-overflow-menu className={`bx--overflow-menu ${styles.overflowMenu}`} ref={wrapperRef}>
      <button
        className={`bx--overflow-menu__trigger ${styles.overflowMenuButton} ${showMenu && 'bx--overflow-menu--open'}`}
        aria-haspopup="true"
        aria-expanded={showMenu}
        id="custom-actions-overflow-menu-trigger"
        aria-controls="custom-actions-overflow-menu"
        onClick={toggleShowMenu}
        style={{
          boxShadow: showMenu ? '0 2px 6px 0 rgb(0 0 0 / 30%)' : 'none',
        }}>
        {menuTitle}
      </button>
      <div
        className="bx--overflow-menu-options bx--overflow-menu--flip"
        tabIndex={0}
        data-floating-menu-direction="bottom"
        role="menu"
        aria-labelledby="custom-actions-overflow-menu-trigger"
        id="custom-actions-overflow-menu"
        style={{
          display: showMenu ? 'block' : 'none',
        }}>
        <ul className="bx--overflow-menu-options__content">{children}</ul>
        <span />
      </div>
    </div>
  );
};

export default CustomOverflowMenuComponent;
