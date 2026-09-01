import React from 'react';
import { TabType } from '../types';
import { Play, History, Settings, User } from 'lucide-react';
import { StatusPayload } from '../../preload';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  status: StatusPayload;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  status,
}) => {
  const getStatusLabel = () => {
    switch (status.status) {
      case 'armed':
        return 'Armed (Press F9)';
      case 'countdown':
        return `Countdown (${status.countdownSeconds ?? 2}s)`;
      case 'typing':
        return `Typing (${status.progress?.percent ?? 0}%)`;
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Stopped';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo">⚡</div>
        <span className="brand-title">NativeReplay QA</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '8px' }}>E2E Hardware Keystroke Engine</span>
      </div>

      <nav className="nav-tabs" aria-label="Desktop Navigation">
        <button
          className={`nav-tab-btn ${activeTab === 'main' ? 'active' : ''}`}
          onClick={() => onSelectTab('main')}
        >
          <Play size={15} />
          <span>Test Runner</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'input-recognition' ? 'active' : ''}`}
          onClick={() => onSelectTab('input-recognition')}
        >
          <Play size={15} />
          <span>Input Recognition</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => onSelectTab('history')}
        >
          <History size={15} />
          <span>History</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectTab('settings')}
        >
          <Settings size={15} />
          <span>Settings</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'account' ? 'active' : ''}`}
          onClick={() => onSelectTab('account')}
        >
          <User size={15} />
          <span>Account</span>
        </button>
      </nav>

      <div className={`status-pill ${status.status}`}>
        <span className="status-dot"></span>
        <span>{getStatusLabel()}</span>
      </div>
    </header>
  );
};
