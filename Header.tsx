import React from 'react';
import { useLocation } from 'react-router-dom';

const Header: React.FC<{ onToggleHeader?: () => void; onToggleMenu?: () => void }> = ({ onToggleHeader, onToggleMenu }) => {
  const loc = useLocation();
  const titleMap: Record<string, string> = {
    '/app/dashboard': 'Dashboard',
    '/app/user-stories': 'My User Stories',
    '/app/team-tests': 'My Test Case',
    '/app/create': 'Create Test Case',
    '/app/work-item': 'Create Work Item',
    '/app/test-suite-add': 'Add to Test Suite',
    '/app/test-plans': 'Test Plans',
  };

  const title = titleMap[loc.pathname] || 'Dashboard';

  return (
    <header className="main-header" id="mainHeader">
      <div className="header-left">
        <button className="btn-toggle-sidebar" onClick={() => onToggleMenu && onToggleMenu()} title="Toggle Menu">☰</button>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="header-actions">
        <button className="btn-icon" onClick={() => onToggleHeader && onToggleHeader()} title="Collapse Header">⬆️</button>
        <button className="btn-icon" title="Refresh">🔄</button>
        <button className="btn-icon" title="Settings">⚙️</button>
      </div>
    </header>
  );
};

export default Header;
