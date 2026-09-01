import React, { useState, useEffect } from 'react';
import { TabType, HistoryItem, AppSettings, AccountState } from './types';
import { StatusPayload } from '../preload';
import { Sidebar } from './components/Sidebar';
import { MainView } from './components/views/MainView';
import { InputRecognitionView } from './components/views/InputRecognitionView';
import { HistoryView } from './components/views/HistoryView';
import { SettingsView } from './components/views/SettingsView';
import { AccountView } from './components/views/AccountView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('main');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('fw_sidebar_collapsed') === 'true';
  });

  // Light / Dark Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('fw_theme') as 'dark' | 'light') || 'dark';
  });

  // Apply theme to HTML root element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fw_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('fw_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Payload & Speed
  const [payload, setPayload] = useState<string>(() => {
    return localStorage.getItem('fw_active_payload') || '';
  });

  const [wpm, setWpm] = useState<number>(() => {
    return Number(localStorage.getItem('fw_wpm')) || 65;
  });

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('fw_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('fw_settings');
      return saved
        ? JSON.parse(saved)
        : {
            defaultWpm: 65,
            jitterVariance: 35,
            countdownBufferSeconds: 2,
            enablePunctuationPauses: true,
          };
    } catch {
      return {
        defaultWpm: 65,
        jitterVariance: 35,
        countdownBufferSeconds: 2,
        enablePunctuationPauses: true,
      };
    }
  });

  // Account State
  const [account, setAccount] = useState<AccountState>(() => {
    try {
      const saved = localStorage.getItem('fw_account');
      return saved
        ? JSON.parse(saved)
        : {
            tier: 'free',
            licenseKey: '',
            apiKey: '',
            isLicenseValid: false,
          };
    } catch {
      return {
        tier: 'free',
        licenseKey: '',
        apiKey: '',
        isLicenseValid: false,
      };
    }
  });

  // Live Typer Status
  const [status, setStatus] = useState<StatusPayload>({
    status: 'idle',
    message: 'Ready',
  });

  // Subscribe to Electron IPC status-change events
  useEffect(() => {
    const unsubscribe = window.electronAPI?.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });
    return () => {
      unsubscribe?.();
    };
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('fw_active_payload', payload);
  }, [payload]);

  useEffect(() => {
    localStorage.setItem('fw_wpm', String(wpm));
  }, [wpm]);

  useEffect(() => {
    localStorage.setItem('fw_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('fw_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('fw_account', JSON.stringify(account));
  }, [account]);

  // History Actions
  const handleSaveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    if (history.length > 0 && history[0].text === item.text) {
      return;
    }
    const newItem: HistoryItem = {
      ...item,
      id: String(Date.now()),
      timestamp: Date.now(),
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all test history?')) {
      setHistory([]);
    }
  };

  const handleSelectHistoryPayload = (text: string) => {
    setPayload(text);
    setActiveTab('main');
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'main':
        return 'Test Runner & Input Replay';
      case 'input-recognition':
        return 'Input Recognition & Target Inspector';
      case 'history':
        return 'Saved Test Execution History';
      case 'settings':
        return 'Engine & Hardware Simulation Settings';
      case 'account':
        return 'Profile & Subscription Account';
      default:
        return '';
    }
  };

  const getStatusLabel = () => {
    switch (status.status) {
      case 'armed':
        return 'Armed (F9)';
      case 'countdown':
        return `Countdown (${status.countdownSeconds ?? 2}s)`;
      case 'typing':
        return `Executing (${status.progress?.percent ?? 0}%)`;
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Aborted';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="app-shell">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        account={account}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace */}
      <main className="app-main">
        {/* Top App Bar */}
        <div className="top-bar">
          <div className="view-title-wrap">
            <span className="view-title">{getTabTitle()}</span>
          </div>

          <div className={`status-pill ${status.status}`}>
            <span className="status-dot"></span>
            <span>{getStatusLabel()}</span>
          </div>
        </div>

        {/* View Component Switcher */}
        {activeTab === 'main' && (
          <MainView
            payload={payload}
            onChangePayload={setPayload}
            wpm={wpm}
            onChangeWpm={setWpm}
            status={status}
            onSaveToHistory={handleSaveToHistory}
            apiKey={account.apiKey}
            licenseKey={account.licenseKey}
          />
        )}

        {activeTab === 'input-recognition' && (
          <InputRecognitionView
            payload={payload}
            onChangePayload={setPayload}
            wpm={wpm}
            onChangeWpm={setWpm}
            apiKey={account.apiKey}
            licenseKey={account.licenseKey}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectPayload={handleSelectHistoryPayload}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onChangeSettings={setSettings}
          />
        )}

        {activeTab === 'account' && (
          <AccountView
            account={account}
            onChangeAccount={setAccount}
          />
        )}
      </main>
    </div>
  );
};
