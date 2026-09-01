import React, { useState, useRef, useEffect } from 'react';
import { TabType, AccountState } from '../types';
import {
  Play,
  History,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  MoreVertical,
  Sun,
  Moon,
  ShieldCheck,
  ScanText,
} from 'lucide-react';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  account: AccountState;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  account,
  theme,
  onToggleTheme,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTabWithClose = (tab: TabType) => {
    onSelectTab(tab);
    setShowProfileMenu(false);
  };

  const isPro = account.licenseKey.trim().length > 0;

  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Top Section */}
      <div className="sidebar-top">
        {/* Sidebar Header & Toggle */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="brand-section">
              <div className="brand-logo">⚡</div>
              <span className="brand-title">NativeReplay</span>
            </div>
          )}

          <button
            className="sidebar-toggle-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            style={{ margin: isCollapsed ? '0 auto' : undefined }}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        {/* Top Pages Navigation (From top to bottom) */}
        <nav className="sidebar-nav" aria-label="Main Pages Navigation">
          <button
            className={`nav-item-btn ${activeTab === 'main' ? 'active' : ''}`}
            onClick={() => onSelectTab('main')}
            title="Test Runner"
          >
            <span className="nav-item-icon">
              <Play size={18} />
            </span>
            {!isCollapsed && <span>Test Runner</span>}
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'input-recognition' ? 'active' : ''}`}
            onClick={() => onSelectTab('input-recognition')}
            title="Input Recognition"
          >
            <span className="nav-item-icon">
              <ScanText size={18} />
            </span>
            {!isCollapsed && <span>Input Recognition</span>}
          </button>

          <button
            className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => onSelectTab('history')}
            title="History"
          >
            <span className="nav-item-icon">
              <History size={18} />
            </span>
            {!isCollapsed && <span>Test History</span>}
          </button>
        </nav>
      </div>

      {/* Bottom Section: Theme Switcher & User Profile */}
      <div className="sidebar-bottom" ref={menuRef}>
        {/* Light / Dark Mode Toggle */}
        <button
          className="theme-toggle-wrapper"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {!isCollapsed && (
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </div>
        </button>

        {/* Profile Popup Dropdown Menu (Profile/Account & Settings) */}
        {showProfileMenu && (
          <div className="profile-menu">
            <button
              className={`menu-action-btn ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => handleSelectTabWithClose('account')}
            >
              <User size={15} />
              <span>Profile & Account</span>
            </button>

            <button
              className={`menu-action-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => handleSelectTabWithClose('settings')}
            >
              <Settings size={15} />
              <span>Settings</span>
            </button>
          </div>
        )}

        {/* Profile Picture Card with 3 Dots */}
        <div
          className="profile-card"
          onClick={() => setShowProfileMenu((prev) => !prev)}
          title="Account & Settings Options"
        >
          <div className="profile-left">
            <div className="avatar-box">
              {isPro ? '★' : 'QA'}
            </div>
            {!isCollapsed && (
              <div className="profile-info">
                <span className="profile-name">QA Engineer</span>
                <span className="profile-tier">
                  {isPro ? 'Cloud Pro ($5/mo)' : 'Standalone'}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              className="more-dots-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu((prev) => !prev);
              }}
              title="More Options"
            >
              <MoreVertical size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
